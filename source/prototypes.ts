Object.defineProperty(Array.prototype, "last", {
	get: function last() {
		return (this as Array<any>)[(this as Array<any>).length - 1];
	}
});

Object.defineProperty(Array.prototype, "first", {
	get: function first() {
		return (this as Array<any>)[0];
	}
});

Object.defineProperty(Array.prototype, "empty", {
	get: function empty() {
		return (this as Array<any>).length === 0;
	}
});

Array.prototype.skip = function (count: number) {
	if (count <= 0) {
		return this;
	}
	return this.slice(count);
}

Array.prototype.take = function (count: number) {
	if (count <= 0) {
		return [];
	}
	return this.slice(0, count);
}

Array.prototype.add = function <T>(...args: T[]) {
	for (const arg of args) {
		this[this.length] = arg;
	}
	return this;
}

Array.prototype.remove = function <T>(...args: T[]) {
	for (const arg of args) {
		for (let index = 0; index < this.length; index++) {
			if (this[index] === arg) {
				delete this[index];
			}
		}
	}
	return this;
}

Array.prototype.match = function <T>(element: T) {
	for (let index = 0; index < this.length; index++) {
		if (this[index] === element) {
			return index;
		}
	}
	return NaN;
}

Array.prototype.contains = function <T>(element: T) {
	return !isNaN(this.match(element));
}

ArrayBuffer.prototype.skip = function (count: number) {
	return this.slice(count);
}

ArrayBuffer.prototype.take = function (count: number) {
	return this.slice(0, count);
}

Number.prototype.clamp = function (minimum: number, maximum: number) {
	return Math.min(Math.max(this as number, minimum), maximum);
}

Number.prototype.truncate = function () {
	return Math.trunc(this as number);
}

Number.prototype.absolute = function () {
	return Math.abs(this as number);
}

RegExp.prototype.match = function (string: string) {
	return this.test(string) ? new RegExpCapture({ groups: this.exec(string)! }) : null;
}

export class RegExpCapture {
	private readonly groups: Array<string>;

	constructor(args: {
		groups: Array<string>;
	}) {
		this.groups = args.groups;
	}
	public group(index: number) {
		return this.groups[index] ?? null;
	}
}

window.until = function (condition: () => boolean, duration: number = 100) {
	return new Promise<void>(async (resolve, reject) => {
		(function recursive() {
			if (condition()) {
				return resolve();
			}
			setTimeout(() => {
				return recursive();
			}, duration);
		})();
	});
}

window.inject = function (before: (...args: any[]) => any, after: (...args: any[]) => any) {
	return function () {
		// @ts-ignore
		before.apply(this, arguments);
		// @ts-ignore
		return after.apply(this, arguments);
	}
}

window.random = function (minimum: number, maximum: number) {
	return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}
