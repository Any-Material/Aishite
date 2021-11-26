// views
import Viewer from "@/app/views/viewer";
import Browser from "@/app/views/browser";
// modules
import settings from "@/modules/settings";
// states
import { StateHandler } from "@/states";

class Navigator extends StateHandler<NavigatorState> {
	/** DO NOT MODIFY UNLESS CERTAIN. */
	public static readonly controller: Record<string, Nullable<React.Component<any, any>>> = {};

	public get state() {
		return super.state;
	}
	public set state(state: Navigator["_state"]) {
		super.state = state;
		// update config.json
		setTimeout(() => {
			settings.state = {
				...settings.state,
				navigator: {
					index: state.index,
					pages: state.pages.map((page) => transform(page.title, page.widget))
				}
			};
		});
	}
	/** append `page` as well as change index */
	public open(name: string, type: string, args: any) {
		this.state = new NavigatorState({
			index: this.state.pages.length,
			pages: [...this.state.pages, { title: name, widget: build(type, args) }]
		});
	}
	/** jump to given index */
	public jump(index: number) {
		this.state = new NavigatorState({
			index: index,
			pages: this.state.pages
		});
	}
	/** close `page` at given index, default to `this.state.index` */
	public close(index: number = this.state.index) {
		this.state = new NavigatorState({
			index: this.state.index.clamp(0, this.state.pages.length - 1 - 1),
			pages: [...this.state.pages.take(index), ...this.state.pages.skip(index + 1)]
		});
	}
	/** rename `page` at given index, default to `this.state.index` */
	public rename(title: string, index: number = this.state.index) {
		this.state = new NavigatorState({
			index: this.state.index,
			pages: [...this.state.pages.take(index), { title: title, widget: this.state.pages[index].widget }, ...this.state.pages.skip(index + 1)]
		});
	}
	/** reorder array of `page` */
	public reorder(index_0: number, index_1: number) {
		throw new Error("Unimplemented");
	}
}

class NavigatorState {
	public index: number;
	public pages: Array<{
		title: string;
		widget: JSX.Element;
	}>;

	constructor(args: Args<NavigatorState>) {
		this.index = args.index;
		this.pages = args.pages;
	}
}
/** Actually...its a `GUID` but who really cares. */
function UUID(): string {
	const unique = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	// prevent duplication
	if (Navigator.controller[unique]) {
		return UUID();
	}
	return unique;
}

function args(UUID: string) {
	// component might be null
	if (Navigator.controller[UUID]) {
		const args = { ...Navigator.controller[UUID]?.props };

		delete args["data-key"];

		for (const key of Object.keys(Navigator.controller[UUID]?.state ?? {})) {
			if (args[key] !== undefined) {
				args[key] = Navigator.controller[UUID]?.state[key];
			}
		}
		return args;
	}
	return null;
}

function build(type: string, args: any) {
	// must be unique
	const cache = UUID();

	switch (type.toUpperCase()) {
		case "BROWSER": {
			return (<Browser ref={(ref) => inspect(cache, ref)} key={cache} data-key={cache} index={args.index ?? 0} query={args.query ?? "language:all"}/>);
		}
		case "VIEWER": {
			return (<Viewer ref={(ref) => inspect(cache, ref)} key={cache} data-key={cache} gallery={args.gallery ?? 6974}/>);
		}
		default: {
			return (<section key={cache}>FALLBACK</section>);
		}
	}
}

function inspect(UUID: string, ref: Nullable<React.Component<any, any>>) {
	// assign
	Navigator.controller[UUID] = ref;
	// attach
	if (ref?.componentDidUpdate) {
		// inject
		ref.componentDidUpdate = inject(ref.componentDidUpdate, () => {
			// update config.json
			settings.state = {
				...settings.state,
				navigator: {
					index: singleton.state.index,
					pages: singleton.state.pages.map((page) => transform(page.title, page.widget))
				}
			};
		});
	}
}

function transform(title: string, widget: JSX.Element) {
	return { type: widget.type.name.toUpperCase(), name: title, args: args(widget.props["data-key"]) ?? widget.props };
}

const singleton = new Navigator({
	state: new NavigatorState({
		index: settings.state.navigator.index,
		pages: settings.state.navigator.pages.map((page) => { return { title: page.name, widget: build(page.type, page.args) }; })
	})
});

export default singleton;
