import { z } from 'zod'

const StreamCustomNodeSpecification = z.object({
  _id: z.string(),
  color: z.string().optional()
})

const StreamSemanticVersion = z.object({
  /**
   * changes effecting the user and are not backwards compatible (parameter changes)
   */
  major: z.number(),
  /**
   * changes effecting the user but are backwards compatible (logic changes)
   */
  minor: z.number(),
  /**
   * changes not effecting the user (bug fixes)
   */
  patch: z.number(),
  /**
   * description for every change on the the node
   */
  changelog: z.array(z.string())
})

const StreamNodeSpecificationAdditionalConnector = z.object({
  name: z.string(),
  description: z.string()
})

const StreamNodeSpecificationInputType = z.enum([
  'STRING',
  'STRING_LONG',
  'STRING_LIST',
  'STRING_MAP',
  'STRING_READONLY',
  'STRING_SELECT',
  'STRING_PASSWORD',
  'NUMBER',
  'BOOLEAN',
  'ANY'
])

const StreamNodeSpecificationInput = z.intersection(
  z.object({
    name: z.string(),
    description: z.string(),
    defaultValue: z.any().optional(),
    example: z.any(),
    advanced: z.boolean().optional(),
    mandatory: z.boolean().optional()
  }),
  z.discriminatedUnion('type', [
    z.object({
      type: StreamNodeSpecificationInputType.exclude(['STRING_SELECT'])
    }),
    z.object({
      type: StreamNodeSpecificationInputType.extract(['STRING_SELECT']),
      options: z.record(z.union([z.string(), z.number()]))
    })
  ])
)

// dependent input start
const PrimitiveSchema = z.union([z.string(), z.number(), z.boolean(), z.null(), z.date(), z.undefined()])

const ComparisonConditionSchema = z
  .object({
    $eq: PrimitiveSchema.optional(),
    $ne: PrimitiveSchema.optional(),
    $gt: PrimitiveSchema.optional(),
    $gte: PrimitiveSchema.optional(),
    $lt: PrimitiveSchema.optional(),
    $lte: PrimitiveSchema.optional()
  })
  .partial()

const StringConditionSchema = z
  .object({
    $contains: z.string().optional(),
    $startsWith: z.string().optional(),
    $endsWith: z.string().optional(),
    $regex: z.string().optional()
  })
  .partial()

const ArrayConditionSchema = z
  .object({
    $in: z.array(PrimitiveSchema).optional(),
    $nin: z.array(PrimitiveSchema).optional()
  })
  .partial()

const MetaConditionSchema = z
  .object({
    $exists: z.boolean().optional(),
    $type: z.enum(['string', 'number', 'boolean', 'object']).optional()
  })
  .partial()

const FieldConditionSchema = ComparisonConditionSchema.merge(StringConditionSchema)
  .merge(ArrayConditionSchema)
  .merge(MetaConditionSchema)
  .partial()

const QuerySchema: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      name: z.union([PrimitiveSchema, FieldConditionSchema]).optional(),

      age: z.union([PrimitiveSchema, FieldConditionSchema]).optional(),

      active: z.union([PrimitiveSchema, FieldConditionSchema]).optional(),

      tags: z.union([z.array(PrimitiveSchema), ArrayConditionSchema]).optional(),

      profile: z
        .union([
          z
            .object({
              city: z.union([PrimitiveSchema, FieldConditionSchema]).optional(),

              score: z.union([PrimitiveSchema, FieldConditionSchema]).optional()
            })
            .partial(),

          QuerySchema
        ])
        .optional(),

      $and: z.array(QuerySchema).optional(),
      $or: z.array(QuerySchema).optional(),
      $nor: z.array(QuerySchema).optional(),
      $not: QuerySchema.optional()
    })
    .partial()
)

const StreamNodeSpecificationDependendInput = z.intersection(
  z.object({
    name: z.string(),
    if: QuerySchema,
    description: z.string(),
    defaultValue: z.any().optional(),
    example: z.any(),
    advanced: z.boolean().optional(),
    mandatory: z.boolean().optional()
  }),
  z.discriminatedUnion('type', [
    z.object({
      type: StreamNodeSpecificationInputType.exclude(['STRING_SELECT'])
    }),
    z.object({
      type: StreamNodeSpecificationInputType.extract(['STRING_SELECT']),
      options: z.record(z.union([z.string(), z.number()]))
    })
  ])
)
// dependent input end

const StreamNodeSpecificationOutputType = z.nativeEnum({
  STRING: 'STRING',
  STRING_LONG: 'STRING_LONG',
  STRING_LIST: 'STRING_LIST',
  STRING_MAP: 'STRING_MAP',
  STRING_READONLY: 'STRING_READONLY',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  ANY: 'ANY',
  JSON: 'JSON'
})

const StreamNodeSpecificationOutput = z.object({
  name: z.string(),
  description: z.string(),
  type: StreamNodeSpecificationOutputType,
  example: z.unknown(),
  howToAccess: z.array(z.string())
})

const StreamNodeSpecificationOutputV2 = z.object({
  name: z.string(),
  description: z.string(),
  type: StreamNodeSpecificationOutputType,
  example: z.unknown()
})

const StreamNodeSpecificationAuthor = z.object({
  name: z.string(),
  company: z.string(),
  email: z.string()
})

const StreamNodeSpecificationType = z.nativeEnum({
  TRIGGER: 'TRIGGER',
  ACTION: 'ACTION',
  CONDITION: 'CONDITION'
})

const StreamNodeSpecificationTag = z.nativeEnum({
  PREVIEW: 'PREVIEW',
  EXPERIMENTAL: 'EXPERIMENTAL'
})

const StreamNodeSpecificationPackage = z.nativeEnum({
  CORE: 'CORE',
  DEV: 'DEV',
  THIRD_PARTY: 'THIRD_PARTY',
  CUSTOM: 'CUSTOM'
})

const nodeSpecificationSchemaV1 = z.object({
  specVersion: z.literal(1),
  name: z.string(),
  description: z.string(),
  type: StreamNodeSpecificationType,
  package: StreamNodeSpecificationPackage,
  category: z.string(),
  version: StreamSemanticVersion,
  author: StreamNodeSpecificationAuthor,
  tag: StreamNodeSpecificationTag.optional(),
  inputs: z.array(StreamNodeSpecificationInput).optional(),
  outputs: z.array(StreamNodeSpecificationOutput).optional(),
  additionalConnectors: z.array(StreamNodeSpecificationAdditionalConnector).optional(),
  path: z.string().optional(),
  customNode: StreamCustomNodeSpecification.optional()
})

const nodeSpecificationSchemaV2 = z.object({
  specVersion: z.literal(2),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  version: StreamSemanticVersion,
  author: StreamNodeSpecificationAuthor,
  tag: StreamNodeSpecificationTag.array().optional(),
  inputs: z.array(StreamNodeSpecificationInput).optional(),
  outputs: z.array(StreamNodeSpecificationOutputV2).optional(),
  additionalConnectors: z.array(StreamNodeSpecificationAdditionalConnector).optional(),
  path: z.string().optional(),
  customNode: StreamCustomNodeSpecification.optional()
})

const nodeSpecificationSchemaV3 = z.object({
  specVersion: z.literal(3),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  version: StreamSemanticVersion,
  author: StreamNodeSpecificationAuthor,
  tag: StreamNodeSpecificationTag.array().optional(),
  inputs: z.array(StreamNodeSpecificationInput).optional(),
  outputs: z.array(StreamNodeSpecificationOutputV2).optional(),
  additionalConnectors: z.array(StreamNodeSpecificationAdditionalConnector).optional(),
  path: z.string().optional(),
  customNode: StreamCustomNodeSpecification.optional(),
  deprecated: z.boolean()
})

const nodeSpecificationSchemaV4 = z.object({
  specVersion: z.literal(4),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  version: StreamSemanticVersion,
  author: StreamNodeSpecificationAuthor,
  tag: StreamNodeSpecificationTag.array().optional(),
  inputs: z.array(StreamNodeSpecificationDependendInput).optional(),
  outputs: z.array(StreamNodeSpecificationOutputV2).optional(),
  additionalConnectors: z.array(StreamNodeSpecificationAdditionalConnector).optional(),
  path: z.string().optional(),
  customNode: StreamCustomNodeSpecification.optional(),
  deprecated: z.boolean()
})

const nodeSpecificationSchema = z.discriminatedUnion('specVersion', [
  nodeSpecificationSchemaV1,
  nodeSpecificationSchemaV2,
  nodeSpecificationSchemaV3,
  nodeSpecificationSchemaV4
])

export const specificationSchema = z.object({
  nodes: z.array(nodeSpecificationSchema),
  engineVersion: z.string().optional(),
  specVersion: z.number().optional()
})

const nodeConstructorSchema = z.function()

export const catalogSchema = z.object({
  name: z.string(),
  logoUrl: z.string(),
  description: z.string(),
  nodes: z.array(nodeConstructorSchema),
  nodeCatalog: z.record(nodeConstructorSchema)
})
