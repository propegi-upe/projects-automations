export type FieldType = "text" | "singleSelect" | "date"

export interface FieldSchema {
  [key: string]: {
    fieldName: string
    type: FieldType
  }
}

export function parseFieldValues(fieldValues: any[], schema: FieldSchema) {
  const result: Record<string, any> = {}

  for (const [key, { fieldName, type }] of Object.entries(schema)) {
    const match = fieldValues.find((f: any) => f?.field?.name === fieldName)

    switch (type) {
      case "text":
        result[key] = match?.text ?? null
        break
      case "singleSelect":
        result[key] = match?.name ?? null
        result[`${key}OptionId`] = match?.optionId ?? null
        break
      case "date":
        result[key] = match?.date ?? null
        break
      default:
        result[key] = null
    }
  }

  return result
}
