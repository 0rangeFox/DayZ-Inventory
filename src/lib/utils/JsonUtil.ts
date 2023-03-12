import Ajv from 'ajv/dist/jtd';
import type { JTDSchemaType } from 'ajv/dist/jtd';
import moize from 'moize';

const ajv: Ajv = new Ajv();

// serialize will only accept data compatible with MyData
const serialize = moize(<T>(schema: JTDSchemaType<T>) => ajv.compileSerializer(schema));
const deserialize = moize(<T>(schema: JTDSchemaType<T>) => ajv.compileParser(schema));

export { serialize, deserialize };
