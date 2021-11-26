// common
import Unit from "@/app/common/unit";
import { Props } from "@/app/common/props";
import { Stateful, EventManager } from "@/app/common/framework";
// layout
import Size from "@/app/layout/size";
import Image from "@/app/layout/image";
import Offset from "@/app/layout/offset";
// modules
import { GalleryScript } from "@/modules/hitomi.la/gallery";
// states
import navigator from "@/states/navigator";

class ViewerProps extends Props<undefined> {
	public gallery: number;

	constructor(args: Args<ViewerProps>) {
		super(args);

		this.gallery = args.gallery;
	}
}

class ViewerState {
	public init: boolean;
	/** Oh boy... due to the `navigatior`'s design I can't name this to `gallery`. */
	public script?: GalleryScript;

	constructor(args: Args<ViewerState>) {
		this.init = args.init;
		this.script = args.script;
	}
}

class Viewer extends Stateful<ViewerProps, ViewerState> {
	protected create() {
		// TODO: use this.binds instead
		navigator.handle((state) => {
			if (!this.state.init && this.visible()) this.macro_0();
		});
		return new ViewerState({ init: false, script: undefined });
	}
	protected events() {
		return [
			new EventManager(this.handler, "DID_MOUNT", () => {
				if (this.visible()) this.macro_0();
			})
		];
	}
	protected postCSS() {
		return {};
	}
	protected preCSS() {
		return {};
	}
	protected build() {
		return (
			<section id={"viewer"} data-scrollable>
				<Size width={Unit(1000)}>
					<Size type={"minimum"} width={Unit(500)}>
						<Size type={"maximum"} width={Unit(100, "%")}>
							<Offset type={"margin"} all={"auto"}>
								{this.state.script ? this.state.script.files.map((file, x) => <Image key={x} source={file.url} />) : <section />}
							</Offset>
						</Size>
					</Size>
				</Size>
			</section>
		);
	}
	/**
	 * Wwhether the component is visible
	 */
	public visible() {
		// @ts-ignore
		if (this.props["data-key"]) {
			// @ts-ignore
			return navigator.state.pages[navigator.state.index].widget.props["data-key"] === this.props["data-key"];
		}
		return this.node()?.closest("section[style*=\"display: block\"]") !== null;
	}
	public macro_0() {
		GalleryScript(this.props.gallery).then((script) => { this.setState({ ...this.state, init: true, script: script }); });
	}
}

export default Viewer;
