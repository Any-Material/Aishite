import Layout from "@/app/common/layout";

import Viewer from "@/app/pages/viewer";
import Browser from "@/app/pages/browser";
import Fallback from "@/app/pages/fallback";

import settings from "@/modules/settings";

import { StateHandler } from "@/handles";

const cache = new Map<string, Nullable<React.Component>>();

class History extends StateHandler<HistoryState> {
	public get state() {
		return super.state;
	}
	public set state(state: History["_state"]) {
		// assign
		super.state = state;
		// update title
		title();
		// update settings.json
		reflect();
	}
	protected create() {
		window.addEventListener("keydown", (event) => {
			// ctrl + w
			if (event.key === "w" && !event.altKey && event.ctrlKey && !event.shiftKey) {
				this.close();
			}
		});
		// update title
		title(this.state.pages[this.state.index])
	}
	/** Append `page` as well as change `this.state.index`. */
	public open(title: string, type: string, args: Record<string, any>) {
		this.state = new HistoryState({
			index: this.state.pages.length,
			pages: [...this.state.pages, builder(title, type, args)]
		});
	}
	/** Jump to given index. */
	public jump(index: number) {
		this.state = new HistoryState({
			index: index,
			pages: this.state.pages
		});
	}
	/** Close `page` at given index, default to `this.state.index`. */
	public close(index: number = this.state.index) {
		switch (this.state.pages.length) {
			case 1: {
				this.state = new HistoryState({
					index: 0,
					pages: [builder("NEW TAB", "BROWSER", {})]
				});
				break;
			}
			default: {
				this.state = new HistoryState({
					index: this.state.index,
					pages: [...this.state.pages.take(index), ...this.state.pages.skip(index + 1)]
				});
				break;
			}
		}
	}
	/** Rename `page` at given index, default to `this.state.index`. */
	public rename(title: string, index: number = this.state.index) {
		this.state = new HistoryState({
			index: this.state.index,
			pages: [...this.state.pages.take(index), { ...this.state.pages[index], title: title }, ...this.state.pages.skip(index + 1)]
		});
	}
	/** Replace current `page` with new `page`. */
	public replace(title: string, type: string, args: Record<string, any>) {
		this.state = new HistoryState({
			index: this.state.index,
			pages: [...this.state.pages.take(this.state.index), builder(title, type, args), ...this.state.pages.skip(this.state.index + 1)]
		});
	}
	/** Reorder array of `page`. */
	public reorder(destination: number) {
		this.state = new HistoryState({
			index: destination,
			pages: this.state.pages.map((page, index) => index === this.state.index ? this.state.pages[destination] : index === destination ? this.state.pages[this.state.index] : page)
		});
	}
}

interface Page {
	title: string;
	element: JSX.Element;
}

class HistoryState {
	public index: number;
	public pages: Array<Page>;

	constructor(args: Args<HistoryState>) {
		this.index = args.index.clamp(0, args.pages.length - 1);
		this.pages = args.pages;
	}
}

function UUID(): string {
	// cache
	const unique = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	// prevent duplication
	if (cache.has(unique)) {
		// recursive
		return UUID();
	}
	return unique;
}

function args(uuid: string) {
	// component might be null
	if (cache.has(uuid)) {
		// cache
		const args: Record<string, any> = {};

		for (const [key, value] of Object.entries(cache.get(uuid)?.props ?? {})) {
			// skip
			if (key === "data-key") continue;

			const _value = ((cache.get(uuid)?.state ?? {}) as Record<string, any>)[key];

			if (_value !== undefined && typeof _value === typeof value) {
				args[key] = _value;
			} else {
				args[key] = value;
			}
		}
		return args;
	}
	return undefined;
}

function proxy(ref: Nullable<React.Component>, uuid: string) {
	// assign
	cache.set(uuid, ref);
	// attach
	if (ref?.componentDidUpdate) {
		// append
		ref.componentDidUpdate = inject(ref.componentDidUpdate, () => reflect());
	}
}

function title(page: Page = singleton.state.pages[singleton.state.index]) {
	document.title = `${classname(page.element)} - ${page.title}`;
}

function reflect() {
	setTimeout(() => {
		settings.state = {
			...settings.state,
			history: {
				index: singleton.state.index,
				pages: singleton.state.pages.map((page) => ({ type: classname(page.element), name: page.title, args: args(page.element.props["data-key"]) ?? page.element.props }))
			}
		};
	});
}

function builder(title: string, type: string, args: Record<string, any>, uuid: string = UUID()) {
	// cache
	const page = { title: title } as Page;

	switch (type) {
		case "FALLBACK": {
			page.element = (<Fallback ref={(ref) => proxy(ref, uuid)} key={uuid} data-key={uuid} {...settings.state.override.fallback} />);
			break;
		}
		case "BROWSER": {
			page.element = (<Browser ref={(ref) => proxy(ref, uuid)} key={uuid} data-key={uuid} index={args.index ?? 0} query={args.query ?? "language = \"all\""} {...settings.state.override.browser} />);
			break;
		}
		case "VIEWER": {
			page.element = (<Viewer ref={(ref) => proxy(ref, uuid)} key={uuid} data-key={uuid} factor={args.factor ?? Layout.width} gallery={args.gallery ?? 0} {...settings.state.override.viewer} />);
			break;
		}
		default: {
			page.element = (<section key={uuid} data-key={uuid}>UNKNOWN</section>);
			break;
		}
	}
	return page;
}

/** **Webpack** in fact change classes' name thus `constructor.name` isn't static, so this function has born. **tl;dr**: class name anchor. */
function classname(element: JSX.Element) {
	switch (element.type) {
		case Fallback: {
			return "FALLBACK";
		}
		case Browser: {
			return "BROWSER";
		}
		case Viewer: {
			return "VIEWER";
		}
		default: {
			return "UNKNOWN";
		}
	}
}

const singleton = new History(
	new HistoryState({
		index: settings.state.history.index,
		pages: settings.state.history.pages.map((page) => builder(page.name, page.type, page.args))
	})
);

export default singleton;
