// To parse this data:
//
//   import { Convert, Poll } from "./file";
//
//   const poll = Convert.toPoll(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Poll {
  Database: Database;
  Parliaments: { [key: string]: Parliament };
  Institutes: { [key: string]: Institute };
  Taskers: { [key: string]: Institute };
  Methods: { [key: string]: Institute };
  Parties: { [key: string]: Party };
  Surveys: { [key: string]: Survey };
}

export interface Database {
  License: License;
  Publisher: string;
  Author: string;
  Last_Update: Date;
}

export interface License {
  Name: string;
  Shortcut: string;
  Link: string;
}

export interface Institute {
  Name: string;
}

export interface Parliament {
  Shortcut: string;
  Name: string;
  Election: string;
}

export interface Party {
  Shortcut: string;
  Name: string;
}

export interface Survey {
  Date: Date;
  Survey_Period: SurveyPeriod;
  Surveyed_Persons: string;
  Parliament_ID: string;
  Institute_ID: string;
  Tasker_ID: string;
  Method_ID: string;
  Results: { [key: string]: number };
}

export interface SurveyPeriod {
  Date_Start: Date;
  Date_End: Date;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toPoll(json: string): Poll {
    return cast(JSON.parse(json), r("Poll"));
  }

  public static pollToJson(value: Poll): string {
    return JSON.stringify(uncast(value, r("Poll")), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ""): never {
  const prettyTyp = prettyTypeName(typ);
  const parentText = parent ? ` on ${parent}` : "";
  const keyText = key ? ` for key "${key}"` : "";

  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`,
  );
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`;
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a);
        })
        .join(", ")}]`;
    }
  } else if (typeof typ === "object" && typ.literal !== undefined) {
    return typ.literal;
  } else {
    return typeof typ;
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};

    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }

  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};

    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }

  return typ.jsToJSON;
}

function transform(
  val: any,
  typ: any,
  getProps: any,
  key: any = "",
  parent: any = "",
): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;

    return invalidValue(typ, val, key, parent);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;

    for (let i = 0; i < l; i++) {
      const typ = typs[i];

      try {
        return transform(val, typ, getProps);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {}
    }

    return invalidValue(typs, val, key, parent);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;

    return invalidValue(
      cases.map((a) => {
        return l(a);
      }),
      val,
      key,
      parent,
    );
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);

    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);

    if (isNaN(d.valueOf())) {
      return invalidValue(l("Date"), val, key, parent);
    }

    return d;
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any,
  ): any {
    if (val === null || typeof val !== "object" || Array.isArray(val)) {
      return invalidValue(l(ref || "object"), val, key, parent);
    }
    const result: any = {};

    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined;

      result[prop.key] = transform(v, prop.typ, getProps, key, ref);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref);
      }
    });

    return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
    if (val === null) return val;

    return invalidValue(typ, val, key, parent);
  }
  if (typ === false) return invalidValue(typ, val, key, parent);
  let ref: any = undefined;

  while (typeof typ === "object" && typ.ref !== undefined) {
    ref = typ.ref;
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
    return typ.hasOwnProperty("unionMembers")
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty("arrayItems")
        ? transformArray(typ.arrayItems, val)
        : typ.hasOwnProperty("props")
          ? transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val, key, parent);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);

  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
  return { literal: typ };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  Poll: o(
    [
      { json: "Database", js: "Database", typ: r("Database") },
      { json: "Parliaments", js: "Parliaments", typ: m(r("Parliament")) },
      { json: "Institutes", js: "Institutes", typ: m(r("Institute")) },
      { json: "Taskers", js: "Taskers", typ: m(r("Institute")) },
      { json: "Methods", js: "Methods", typ: m(r("Institute")) },
      { json: "Parties", js: "Parties", typ: m(r("Party")) },
      { json: "Surveys", js: "Surveys", typ: m(r("Survey")) },
    ],
    false,
  ),
  Database: o(
    [
      { json: "License", js: "License", typ: r("License") },
      { json: "Publisher", js: "Publisher", typ: "" },
      { json: "Author", js: "Author", typ: "" },
      { json: "Last_Update", js: "Last_Update", typ: Date },
    ],
    false,
  ),
  License: o(
    [
      { json: "Name", js: "Name", typ: "" },
      { json: "Shortcut", js: "Shortcut", typ: "" },
      { json: "Link", js: "Link", typ: "" },
    ],
    false,
  ),
  Institute: o([{ json: "Name", js: "Name", typ: "" }], false),
  Parliament: o(
    [
      { json: "Shortcut", js: "Shortcut", typ: "" },
      { json: "Name", js: "Name", typ: "" },
      { json: "Election", js: "Election", typ: "" },
    ],
    false,
  ),
  Party: o(
    [
      { json: "Shortcut", js: "Shortcut", typ: "" },
      { json: "Name", js: "Name", typ: "" },
    ],
    false,
  ),
  Survey: o(
    [
      { json: "Date", js: "Date", typ: Date },
      { json: "Survey_Period", js: "Survey_Period", typ: r("SurveyPeriod") },
      { json: "Surveyed_Persons", js: "Surveyed_Persons", typ: "" },
      { json: "Parliament_ID", js: "Parliament_ID", typ: "" },
      { json: "Institute_ID", js: "Institute_ID", typ: "" },
      { json: "Tasker_ID", js: "Tasker_ID", typ: "" },
      { json: "Method_ID", js: "Method_ID", typ: "" },
      { json: "Results", js: "Results", typ: m(3.14) },
    ],
    false,
  ),
  SurveyPeriod: o(
    [
      { json: "Date_Start", js: "Date_Start", typ: Date },
      { json: "Date_End", js: "Date_End", typ: Date },
    ],
    false,
  ),
};
