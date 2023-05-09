import { reflect, ReflectedConstructorParameter } from "typescript-rtti";

export class MissingFieldException implements Error {
    name = "MissingFieldException";
    message;

    constructor(fieldName: string) {
        this.message = `Field ${fieldName} is missing`;
    }
}

const _cls_: Record<string, any> = {};

function getClassForName(name: string, modelIndex: unknown): any {
    modelIndex;

    if (!_cls_[name]) {
        if (name.match(/^[a-zA-Z\\.]+$/)) _cls_[name] = eval(`modelIndex.${name}`);
        else throw new Error("Tried loading an unknown class: " + name);
    }
    return _cls_[name];
}

function getFieldClassName(parameter: ReflectedConstructorParameter): string {
    return parameter.type.toString().substring(6);
}

export function forceArrayType<T>(
    list: T[],
    klass: new (...args: any[]) => T,
    parent = ""
): T[] {
    if (list.length == 0 || typeof list[0] !== "object") return [];
    return list.map((item, index) => forceObjectType(item, klass, `${parent}.${index}`));
}

export function forceObjectType<T>(
    body: T,
    klass: new (...args: any[]) => T,
    modelIndex: unknown,
    parent = "$"
): T {
    const tmpBody = body as Record<string, any>;
    const parameters = reflect(klass).parameters;

    const args = parameters.map((parameter) => {
        const field = tmpBody[parameter.name];
        const fieldPath = `${parent}.${parameter.name}`;

        if (!parameter.isOptional && (field !== 0 && !field)) {
            throw new MissingFieldException(fieldPath);
        }

        if (field) {
            if (typeof field !== "object") return field;

            let fieldClassName = getFieldClassName(parameter);
            if (
                fieldClassName === "ObjectId" ||
                fieldClassName === "Date"
            ) return field;

            fieldClassName = fieldClassName.replace("[]", "");
            if (parameter.type.isArray()) {
                return forceArrayType(field, getClassForName(fieldClassName, modelIndex), fieldPath);
            } else {
                return forceObjectType(field, getClassForName(fieldClassName, modelIndex), fieldPath);
            }
        }
    });

    // eslint-disable-next-line new-cap
    return new klass(...args);
}

export function is(type: string, obj: unknown) {
    const clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
}
