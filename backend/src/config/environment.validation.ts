import Joi from 'joi';

import { NodeEnvironment } from '../common/enums/node-environment.enum';

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(NodeEnvironment))
    .default(NodeEnvironment.Development),
  APP_NAME: Joi.string().default('LOMS API'),
  APP_PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api'),
  API_VERSION: Joi.string().pattern(/^\d+$/).default('1'),
  CORS_ENABLED: Joi.boolean().default(true),
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  CORS_CREDENTIALS: Joi.boolean().default(true),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_DATABASE: Joi.string().required(),
  DB_LOGGING: Joi.boolean().default(false),
  SWAGGER_PATH: Joi.string().default('docs'),
});
