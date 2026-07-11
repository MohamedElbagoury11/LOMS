import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, FindOptionsWhere, QueryFailedError, Repository } from 'typeorm';

import { SortDirection } from '../../../common/enums/sort-direction.enum';
import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { ValidationException } from '../../../common/exceptions/validation.exception';
import { PaginationResult } from '../../../common/pagination/interfaces/pagination-result.interface';
import { PaginationHelper } from '../../../common/pagination/pagination.helper';
import { AuditAction } from '../../audit/enums/audit-action.enum';
import { AuditEntity } from '../../audit/enums/audit-entity.enum';
import { AuditService } from '../../audit/services/audit.service';
import { ClientQueryDto, ClientSortOrder } from '../dto/requests/client-query.dto';
import { CreateClientDto } from '../dto/requests/create-client.dto';
import { UpdateClientDto } from '../dto/requests/update-client.dto';
import { ClientResponseDto } from '../dto/responses/client-response.dto';
import { ClientAddressDto } from '../dto/shared/client-address.dto';
import { ClientAttachmentDto } from '../dto/shared/client-attachment.dto';
import { ClientContactDto } from '../dto/shared/client-contact.dto';
import { ClientNoteDto } from '../dto/shared/client-note.dto';
import { ClientAddress } from '../entities/client-address.entity';
import { ClientAttachment } from '../entities/client-attachment.entity';
import { ClientContact } from '../entities/client-contact.entity';
import { ClientNote } from '../entities/client-note.entity';
import { Client } from '../entities/client.entity';
import { ClientStatus } from '../enums/client-status.enum';
import { ClientType } from '../enums/client-type.enum';

export interface ClientAuditContext {
    userId?: string | null;
    username?: string | null;
    ipAddress?: string;
    userAgent?: string;
}

@Injectable()
export class ClientsService {
    private readonly logger = new Logger(ClientsService.name);

    constructor(
        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,
        private readonly dataSource: DataSource,
        private readonly auditService: AuditService,
    ) {}

    async create(dto: CreateClientDto, auditContext?: ClientAuditContext): Promise<ClientResponseDto> {
        this.validateClientShape(dto.type, dto.phone, dto.firstName ?? null, dto.lastName ?? null, dto.organizationName ?? null);

        const normalizedPayload = this.normalizeClientPayload(dto);

        for (let attempt = 0; attempt < 5; attempt += 1) {
            const clientCode = await this.generateClientCode();

            try {
                const client = await this.executeInTransaction(async (manager) => {
                    const repository = manager.getRepository(Client);
                    await this.ensureNoDuplicates(repository, Object.assign({}, normalizedPayload, { clientCode }));

                    const entity = repository.create({
                        clientCode,
                        type: normalizedPayload.type,
                        status: normalizedPayload.status,
                        firstName: normalizedPayload.firstName,
                        lastName: normalizedPayload.lastName,
                        organizationName: normalizedPayload.organizationName,
                        passportNumber: normalizedPayload.passportNumber,
                        phone: normalizedPayload.phone,
                        email: normalizedPayload.email,
                        nationalId: normalizedPayload.nationalId,
                        taxNumber: normalizedPayload.taxNumber,
                        commercialRegistration: normalizedPayload.commercialRegistration,
                        dateOfBirth: normalizedPayload.dateOfBirth,
                        gender: normalizedPayload.gender,
                        preferredLanguage: normalizedPayload.preferredLanguage,
                        notes: normalizedPayload.notes,
                        createdBy: auditContext?.userId ?? null,
                        updatedBy: auditContext?.userId ?? null,
                    });

                    return repository.save(entity);
                });

                await this.emitAudit(AuditAction.CLIENT_CREATED, client.id, auditContext);

                return this.toResponseDto(client);
            } catch (error) {
                if (this.isClientCodeDuplicateError(error)) {
                    continue;
                }

                if (this.isUniqueConstraintError(error)) {
                    throw new ConflictException(this.resolveUniqueConstraintMessage(error));
                }

                throw error;
            }
        }

        throw new ConflictException('Unable to allocate a unique client code.');
    }

    async update(id: string, dto: UpdateClientDto, auditContext?: ClientAuditContext): Promise<ClientResponseDto> {
        if (Object.keys(dto).length === 0) {
            throw new ValidationException('At least one field is required for update.', []);
        }

        const client = await this.executeInTransaction(async (manager) => {
            const repository = manager.getRepository(Client);
            const existing = await repository.findOne({ where: { id }, withDeleted: true });

            if (!existing) {
                throw new NotFoundException('Client not found.');
            }

            if (existing.deletedAt) {
                throw new ConflictException('Archived clients cannot be updated.');
            }

            if (dto.type && dto.type !== existing.type) {
                throw new ValidationException('Client type cannot be changed after creation.', []);
            }

            if (dto.status === ClientStatus.Archived) {
                throw new ValidationException('Use archive/soft delete instead of setting the archived status directly.', []);
            }

            const effectiveType = dto.type ?? existing.type;
            const effectivePhone = this.normalizePhone(dto.phone ?? existing.phone);
            const effectiveFirstName = dto.firstName ?? existing.firstName;
            const effectiveLastName = dto.lastName ?? existing.lastName;
            const effectiveOrganizationName = dto.organizationName ?? existing.organizationName;

            this.validateClientShape(
                effectiveType,
                effectivePhone,
                effectiveFirstName ?? null,
                effectiveLastName ?? null,
                effectiveOrganizationName ?? null,
            );

            const normalizedPayload = this.normalizeClientPayload(dto, existing);
            await this.ensureNoDuplicates(repository, Object.assign({}, normalizedPayload, { id }), existing.id);

            Object.assign(existing, {
                type: normalizedPayload.type,
                status: normalizedPayload.status,
                firstName: normalizedPayload.firstName,
                lastName: normalizedPayload.lastName,
                organizationName: normalizedPayload.organizationName,
                passportNumber: normalizedPayload.passportNumber,
                phone: normalizedPayload.phone,
                email: normalizedPayload.email,
                nationalId: normalizedPayload.nationalId,
                taxNumber: normalizedPayload.taxNumber,
                commercialRegistration: normalizedPayload.commercialRegistration,
                dateOfBirth: normalizedPayload.dateOfBirth,
                gender: normalizedPayload.gender,
                preferredLanguage: normalizedPayload.preferredLanguage,
                notes: normalizedPayload.notes,
                updatedBy: auditContext?.userId ?? null,
            });

            return repository.save(existing);
        });

        await this.emitAudit(AuditAction.CLIENT_UPDATED, client.id, auditContext);

        return this.toResponseDto(client);
    }

    async findOne(id: string): Promise<ClientResponseDto> {
        const client = await this.clientRepository.findOne({
            where: { id },
            relations: ['contacts', 'addresses', 'notesCollection', 'attachments'],
        });

        if (!client) {
            throw new NotFoundException('Client not found.');
        }

        return this.toResponseDto(client);
    }

    async findAll(query: ClientQueryDto): Promise<PaginationResult<ClientResponseDto>> {
        const baseQuery = this.clientRepository.createQueryBuilder('client');
        this.applyFilters(baseQuery, query);

        const totalItems = await baseQuery.clone().getCount();

        const normalized = PaginationHelper.normalize(Object.assign({}, query, {
            sortDirection: query.sortOrder === ClientSortOrder.Desc ? SortDirection.Desc : SortDirection.Asc,
        }));
        const skip = PaginationHelper.getSkip(Object.assign({}, query, {
            sortDirection: query.sortOrder === ClientSortOrder.Desc ? SortDirection.Desc : SortDirection.Asc,
        }));

        const rows = await baseQuery
            .leftJoinAndSelect('client.contacts', 'contacts')
            .leftJoinAndSelect('client.addresses', 'addresses')
            .leftJoinAndSelect('client.notesCollection', 'notesCollection')
            .leftJoinAndSelect('client.attachments', 'attachments')
            .orderBy(this.resolveSortBy(query.sortBy), query.sortOrder === ClientSortOrder.Desc ? 'DESC' : 'ASC')
            .skip(skip)
            .take(normalized.limit)
            .getMany();

        return PaginationHelper.createResult(
            rows.map((row) => this.toResponseDto(row)),
            totalItems,
            Object.assign({}, query, {
                sortDirection: query.sortOrder === ClientSortOrder.Desc ? SortDirection.Desc : SortDirection.Asc,
            }),
        );
    }

    async softDelete(id: string, auditContext?: ClientAuditContext): Promise<void> {
        const existing = await this.clientRepository.findOne({ where: { id }, withDeleted: true });

        if (!existing) {
            throw new NotFoundException('Client not found.');
        }

        if (existing.deletedAt) {
            throw new ConflictException('Client is already archived.');
        }

        if (existing.status !== ClientStatus.Active) {
            throw new ValidationException('Only active clients can be archived.', []);
        }

        await this.executeInTransaction(async (manager) => {
            const repository = manager.getRepository(Client);
            const current = await repository.findOne({ where: { id }, withDeleted: true });

            if (!current) {
                throw new NotFoundException('Client not found.');
            }

            Object.assign(current, {
                status: ClientStatus.Archived,
                deletedAt: new Date(),
                deletedBy: auditContext?.userId ?? null,
                updatedBy: auditContext?.userId ?? null,
            });

            await repository.save(current);
        });

        await this.emitAudit(AuditAction.CLIENT_DELETED, id, auditContext);
    }

    async restore(id: string, auditContext?: ClientAuditContext): Promise<ClientResponseDto> {
        const existing = await this.clientRepository.findOne({ where: { id }, withDeleted: true });

        if (!existing) {
            throw new NotFoundException('Client not found.');
        }

        if (!existing.deletedAt) {
            throw new ConflictException('Client is not archived.');
        }

        const restored = await this.executeInTransaction(async (manager) => {
            const repository = manager.getRepository(Client);
            const current = await repository.findOne({ where: { id }, withDeleted: true });

            if (!current) {
                throw new NotFoundException('Client not found.');
            }

            Object.assign(current, {
                status: ClientStatus.Active,
                deletedAt: null,
                deletedBy: null,
                updatedBy: auditContext?.userId ?? null,
            });

            return repository.save(current);
        });

        await this.emitAudit(AuditAction.CLIENT_UPDATED, restored.id, auditContext);

        return this.toResponseDto(restored);
    }

    private async executeInTransaction<T>(operation: (manager: EntityManager) => Promise<T>): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await operation(queryRunner.manager);
            await queryRunner.commitTransaction();
            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private async ensureClientCodeAvailable(repository: Repository<Client>, clientCode: string): Promise<void> {
        const existing = await repository.findOne({ where: { clientCode }, withDeleted: true });

        if (existing) {
            throw new ConflictException('Client code already exists.', [`Client code ${clientCode} already exists.`]);
        }
    }

    private async ensureNoDuplicates(
        repository: Repository<Client>,
        payload: Partial<Client> & { id?: string },
        currentId?: string,
    ): Promise<void> {
        const checks: { field: keyof Client; value: string | null | undefined }[] = [
            { field: 'phone', value: payload.phone },
            { field: 'email', value: payload.email },
            { field: 'nationalId', value: payload.nationalId },
            { field: 'taxNumber', value: payload.taxNumber },
            { field: 'commercialRegistration', value: payload.commercialRegistration },
            { field: 'passportNumber', value: payload.passportNumber },
        ];

        for (const check of checks) {
            if (!check.value) {
                continue;
            }

            const normalizedValue = check.field === 'email'
                ? check.value.trim().toLowerCase()
                : check.value.trim();
            if (!normalizedValue) {
                continue;
            }

            const where: FindOptionsWhere<Client> = { [check.field]: normalizedValue };
            const existing = await repository.findOne({ where, withDeleted: true });

            if (existing && existing.id !== currentId) {
                throw new ConflictException(`A client with the same ${check.field} already exists.`);
            }
        }

        if (payload.clientCode) {
            await this.ensureClientCodeAvailable(repository, payload.clientCode);
        }
    }

    private async generateClientCode(): Promise<string> {
        const lastClient = await this.clientRepository
            .createQueryBuilder('client')
            .select('client.clientCode', 'clientCode')
            .orderBy('client.clientCode', 'DESC')
            .limit(1)
            .getRawOne<{ clientCode: string }>();

        if (!lastClient?.clientCode) {
            return 'CLI-000001';
        }

        const match = /^CLI-(\d+)$/.exec(lastClient.clientCode);
        if (!match) {
            return 'CLI-000001';
        }

        const nextNumber = Number.parseInt(match[1], 10) + 1;
        return `CLI-${String(nextNumber).padStart(6, '0')}`;
    }

    private applyFilters(queryBuilder: ReturnType<Repository<Client>['createQueryBuilder']>, query: ClientQueryDto): void {
        queryBuilder.andWhere('client.deletedAt IS NULL');

        if (query.search) {
            const likeValue = `%${query.search}%`;
            queryBuilder.andWhere(
                '(LOWER(COALESCE(client.clientCode, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(client.firstName, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(client.lastName, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(client.organizationName, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(client.phone, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(client.email, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(client.nationalId, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(client.taxNumber, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(client.commercialRegistration, \'\')) LIKE LOWER(:search) OR LOWER(COALESCE(client.notes, \'\')) LIKE LOWER(:search))',
                { search: likeValue },
            );
        }

        if (query.status) {
            queryBuilder.andWhere('client.status = :status', { status: query.status });
        }

        if (query.type) {
            queryBuilder.andWhere('client.type = :type', { type: query.type });
        }

        if (query.createdFrom) {
            queryBuilder.andWhere('client.createdAt >= :createdFrom', { createdFrom: query.createdFrom });
        }

        if (query.createdTo) {
            queryBuilder.andWhere('client.createdAt <= :createdTo', { createdTo: query.createdTo });
        }
    }

    private resolveSortBy(sortBy?: string): string {
        const allowedSortFields = new Set([
            'clientCode',
            'type',
            'status',
            'firstName',
            'lastName',
            'organizationName',
            'phone',
            'email',
            'nationalId',
            'taxNumber',
            'commercialRegistration',
            'createdAt',
            'updatedAt',
        ]);

        const normalizedSortBy = sortBy?.trim();
        const field = normalizedSortBy && allowedSortFields.has(normalizedSortBy) ? normalizedSortBy : 'createdAt';
        return `client.${field}`;
    }

    private async emitAudit(action: AuditAction, entityId: string, auditContext?: ClientAuditContext): Promise<void> {
        try {
            await this.auditService.logSuccess({
                userId: auditContext?.userId ?? null,
                username: auditContext?.username ?? null,
                action,
                entity: AuditEntity.CLIENT,
                entityId,
                ipAddress: auditContext?.ipAddress ?? 'unknown',
                userAgent: auditContext?.userAgent ?? 'system',
                details: { entity: 'client' },
            });
        } catch (error) {
            this.logger.warn(`Audit emission failed for client ${entityId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private validateClientShape(
        type: ClientType,
        phone: string,
        firstName: string | null,
        lastName: string | null,
        organizationName: string | null,
    ): void {
        if (!phone.trim()) {
            throw new ValidationException('Phone is required.', []);
        }

        if (type === ClientType.Individual) {
            if (!firstName?.trim() || !lastName?.trim()) {
                throw new ValidationException('Individual clients require both first name and last name.', []);
            }
        }

        if (type === ClientType.Organization) {
            if (!organizationName?.trim()) {
                throw new ValidationException('Organization clients require an organization name.', []);
            }
        }
    }

    private normalizePhone(phone: string | null | undefined): string {
        const trimmed = phone?.trim();
        if (!trimmed) {
            throw new ValidationException('Phone is required.', []);
        }

        return trimmed.replace(/\s+/g, '');
    }

    private normalizeClientPayload(
        dto: CreateClientDto | UpdateClientDto,
        existing?: Partial<Client>,
    ): Partial<Client> & { type: ClientType; status: ClientStatus; phone: string } {
        const normalizedPhone = this.normalizePhone(dto.phone ?? existing?.phone ?? null);
        const normalizedEmail = dto.email ?? existing?.email ?? null;
        const normalizedType = dto.type ?? existing?.type ?? ClientType.Individual;
        const normalizedStatus = dto.status ?? existing?.status ?? ClientStatus.Active;

        return {
            type: normalizedType,
            status: normalizedStatus,
            firstName: dto.firstName ?? existing?.firstName ?? null,
            lastName: dto.lastName ?? existing?.lastName ?? null,
            organizationName: dto.organizationName ?? existing?.organizationName ?? null,
            passportNumber: dto.passportNumber ?? existing?.passportNumber ?? null,
            phone: normalizedPhone,
            email: normalizedEmail ? normalizedEmail.trim().toLowerCase() : null,
            nationalId: dto.nationalId ?? existing?.nationalId ?? null,
            taxNumber: dto.taxNumber ?? existing?.taxNumber ?? null,
            commercialRegistration: dto.commercialRegistration ?? existing?.commercialRegistration ?? null,
            dateOfBirth: dto.dateOfBirth ?? existing?.dateOfBirth ?? null,
            gender: dto.gender ?? existing?.gender ?? null,
            preferredLanguage: dto.preferredLanguage ?? existing?.preferredLanguage ?? null,
            notes: dto.notes ?? existing?.notes ?? null,
        };
    }

    private isClientCodeDuplicateError(error: unknown): boolean {
        if (error instanceof QueryFailedError) {
            const driverErrorCode = (error as { driverError?: { code?: string } }).driverError?.code ?? '';
            const details = `${error.message}${driverErrorCode}`;
            return /client_code|idx_clients_client_code|ER_DUP_ENTRY|23505/i.test(details);
        }

        const message = error instanceof Error ? error.message : String(error);
        return /client_code|idx_clients_client_code|ER_DUP_ENTRY|23505/i.test(message);
    }

    private isUniqueConstraintError(error: unknown): boolean {
        if (error instanceof QueryFailedError) {
            const driverErrorCode = (error as { driverError?: { code?: string } }).driverError?.code ?? '';
            const details = `${error.message}${driverErrorCode}`;
            return /ER_DUP_ENTRY|23505|duplicate/i.test(details);
        }

        const message = error instanceof Error ? error.message : String(error);
        return /ER_DUP_ENTRY|23505|duplicate/i.test(message);
    }

    private resolveUniqueConstraintMessage(error: unknown): string {
        const details = String(error instanceof Error ? error.message : error);
        if (/UQ_clients_client_code/i.test(details)) {
            return 'A client with the same client code already exists.';
        }

        if (/UQ_clients_phone/i.test(details)) {
            return 'A client with the same phone number already exists.';
        }

        if (/UQ_clients_email/i.test(details)) {
            return 'A client with the same email address already exists.';
        }

        if (/UQ_clients_national_id/i.test(details)) {
            return 'A client with the same national ID already exists.';
        }

        if (/UQ_clients_tax_number/i.test(details)) {
            return 'A client with the same tax number already exists.';
        }

        if (/UQ_clients_commercial_registration/i.test(details)) {
            return 'A client with the same commercial registration already exists.';
        }

        if (/UQ_clients_passport_number/i.test(details)) {
            return 'A client with the same passport number already exists.';
        }

        return 'A client with the supplied unique field already exists.';
    }

    private toResponseDto(client: Client): ClientResponseDto {
        return {
            id: client.id,
            clientCode: client.clientCode,
            type: client.type,
            status: client.status,
            firstName: client.firstName,
            lastName: client.lastName,
            organizationName: client.organizationName,
            phone: client.phone,
            email: client.email,
            nationalId: client.nationalId,
            taxNumber: client.taxNumber,
            commercialRegistration: client.commercialRegistration,
            dateOfBirth: client.dateOfBirth,
            gender: client.gender,
            preferredLanguage: client.preferredLanguage,
            notes: client.notes,
            contacts: client.contacts.map((contact) => this.toContactDto(contact)),
            addresses: client.addresses.map((address) => this.toAddressDto(address)),
            notesCollection: client.notesCollection.map((note) => this.toNoteDto(note)),
            attachments: client.attachments.map((attachment) => this.toAttachmentDto(attachment)),
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
        };
    }

    private toContactDto(contact: ClientContact): ClientContactDto {
        return {
            id: contact.id,
            name: contact.name,
            position: contact.position,
            phone: contact.phone,
            email: contact.email,
            isPrimary: contact.isPrimary,
            createdAt: contact.createdAt,
        };
    }

    private toAddressDto(address: ClientAddress): ClientAddressDto {
        return {
            id: address.id,
            country: address.country,
            city: address.city,
            district: address.district,
            street: address.street,
            building: address.building,
            floor: address.floor,
            postalCode: address.postalCode,
            isPrimary: address.isPrimary,
            createdAt: address.createdAt,
        };
    }

    private toNoteDto(note: ClientNote): ClientNoteDto {
        return {
            id: note.id,
            content: note.content,
            createdAt: note.createdAt,
        };
    }

    private toAttachmentDto(attachment: ClientAttachment): ClientAttachmentDto {
        return {
            id: attachment.id,
            fileName: attachment.fileName,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
            storageKey: attachment.storageKey,
            type: attachment.type,
            createdAt: attachment.createdAt,
        };
    }
}
