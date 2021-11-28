export enum Prefix {
	AND		= "",
	INCLUDE	= "+",
	EXCLUDE	= "-"
}

export enum Field {
	ID			= "id",
	TYPE		= "type",
	CHARACTER	= "character",
	LANGUAGE	= "language",
	SERIES		= "series",
	ARTIST		= "artist",
	GROUP		= "group",
	TAG			= "tag",
	MALE		= "male",
	FEMALE		= "female",
	STATUS		= "status"
}

export class Tag {
	public readonly field: Field;
	public readonly value: string;

	constructor(args: {
		field: Tag["field"];
		value: Tag["value"];
	}) {
		this.field = args.field;
		this.value = args.value;
	}
	public url() {
		switch (this.field) {
			case Field.LANGUAGE: {
				return `https://ltn.hitomi.la/index-${this.value}.nozomi`;
			}
			case Field.MALE:
			case Field.FEMALE: {
				return `https://ltn.hitomi.la/tag/${this.field}:${this.value.replace(/_/g, "%20")}-all.nozomi`;
			}
			default: {
				return `https://ltn.hitomi.la/${this.field}/${this.value.replace(/_/g, "%20")}-all.nozomi`;
			}
		}
	}
	public toString() {
		return `${this.field}:${this.value}`;
	}
}

const _Prefix = new RegExp(`^(|\\+|-)`);
const _Tag = new RegExp(`${_Prefix.source}(${Object.values(Field).join("|")}):([\\w]+)`);

declare global {
	interface String {
		toPrefix(): Nullable<Prefix>;
		toField(): Nullable<Field>;
	}
}

String.prototype.toPrefix = function () {
	for (const prefix of Object.values(Prefix)) {
		if (prefix === this) {
			return prefix;
		}
	}
	return null;
}

String.prototype.toField = function () {
	for (const field of Object.values(Field)) {
		if (field === this) {
			return field;
		}
	}
	return null;
}

export class Encode {
	public parse(input: string) {
		const query: Array<{ prefix: Prefix, tag: Tag }> = [];

		for (const chunk of (input + "\u0020").split("\u0020")) {
			//
			// cache
			//
			const match = _Tag.match(chunk);

			if (match) {
				query.add({
					prefix: match.group(1)!.toPrefix()!,
					tag: new Tag({
						field: match.group(2)!.toField()!,
						value: match.group(3)!.toString()!
					})
				});
			}
		}
		return query;
	}
}

export default (
	//
	// singleton
	//
	new Encode()
)
