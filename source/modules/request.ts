type RequestType = ("GET" | "PUT" | "POST" | "DELETE" | "HEAD");

type RequestHeaders = Record<string, string>;

class RequestOptions {
	public readonly request: {
		url: string;
		type: XMLHttpRequestResponseType;
		method: RequestType;
	};
	public readonly partial: {
		retry?: number;
		headers?: RequestHeaders;
		redirects?: number;
	};
	public readonly private: {
		retry?: number;
		redirects?: number;
	};

	constructor(args: Args<RequestOptions>) {
		this.request = args.request;
		this.partial = args.partial;
		this.private = args.private;
	}
}

class RequestResponse<T extends XMLHttpRequestResponseType> {
	public readonly body: T extends "arraybuffer" ? ArrayBuffer : T extends "document" ? Document : T extends "json" ? Record<string, any> : T extends "text" ? string : (ArrayBuffer | Document | JSON | string);
	public readonly status: {
		code: number;
		message: string;
	};
	public readonly headers: RequestHeaders;

	constructor(args: Args<RequestResponse<T>> & { body: any }) {
		this.body = args.body;
		this.status = args.status;
		this.headers = args.headers;
	}
}

/** @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest */
class Request {
	public async send(args: RequestOptions) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const headers: RequestHeaders = {};
	
			// ready
			xhr.open(args.request.method, args.request.url.replace(/\s/g, "%20"), true);
			// set data type
			xhr.responseType = args.request.type;
	
			args.partial.headers ??= {};
	
			for (const key of Object.keys(args.partial.headers)) {
				xhr.setRequestHeader(key, args.partial.headers[key]);
			}

			xhr.addEventListener("readystatechange", () => {
				if (xhr.readyState === xhr.HEADERS_RECEIVED) {
					/** @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders */
					for (const header of xhr.getAllResponseHeaders().trim().split(/[\r\n]+/)) {
						// 0: key
						// 1: value
						const [key, value] = header.split(/:\s/) as [string, string];
	
						headers[key] = value;
					}
					// redirects
					if (headers["location"] && (args.partial.redirects ?? 10) > (args.private.redirects ?? 0)) {
						return this.send(
							new RequestOptions({
								...args,
								request: { ...args.request, url: headers["location"] },
								private: { ...args.private, redirects: (args.private.redirects ?? 0) + 1 }
							})
						);
					}
				}
			});
			xhr.addEventListener("loadend", () => {
				switch (xhr.status) {
					case 404: {
						// retry
						if ((args.partial.retry ?? 0) > (args.private.retry ?? 0)) {
							// make a new request
							return this.send(
								new RequestOptions({
									...args,
									private: { ...args.private, retry: (args.private.retry ?? 0) + 1 }
								})
							);
						}
						break;
					}
				}
				return resolve(new RequestResponse({
					body: xhr.response,
					status: {
						code: xhr.status,
						message: xhr.statusText
					},
					headers: headers
				}));
			});
			xhr.addEventListener("abort", (event) => {
				return reject(event);
			});
			xhr.addEventListener("error", (event) => {
				return reject(event);
			});
			xhr.addEventListener("timeout", (event) => {
				return reject(event);
			});
			// fire
			xhr.send();
		});
	}
	public GET(url: string, type: "arraybuffer", options?: RequestOptions["partial"]): Promise<RequestResponse<"arraybuffer">>
	public GET(url: string, type: "document", options?: RequestOptions["partial"]): Promise<RequestResponse<"document">>
	public GET(url: string, type: "json", options?: RequestOptions["partial"]): Promise<RequestResponse<"json">>
	public GET(url: string, type: "text", options?: RequestOptions["partial"]): Promise<RequestResponse<"text">>
	
	public GET(url: string, type: RequestOptions["request"]["type"], options?: RequestOptions["partial"]) {
		return this.send(new RequestOptions({ request: { url: url, type: type, method: "GET" }, partial: { ...options }, private: {} }));
	}
	public PUT(url: string, type: RequestOptions["request"]["type"], options?: RequestOptions["partial"]) {
		return this.send(new RequestOptions({ request: { url: url, type: type, method: "PUT" }, partial: { ...options }, private: {} }));
	}
	public POST(url: string, type: RequestOptions["request"]["type"], options?: RequestOptions["partial"]) {
		return this.send(new RequestOptions({ request: { url: url, type: type, method: "POST" }, partial: { ...options }, private: {} }));
	}
	public HEAD(url: string, type: RequestOptions["request"]["type"], options?: RequestOptions["partial"]) {
		return this.send(new RequestOptions({ request: { url: url, type: type, method: "DELETE" }, partial: { ...options }, private: {} }));
	}
	public DELETE(url: string, type: RequestOptions["request"]["type"], options?: RequestOptions["partial"]) {
		return this.send(new RequestOptions({ request: { url: url, type: type, method: "DELETE" }, partial: { ...options }, private: {} }));
	}
}

const singleton = new Request();

export default singleton;
