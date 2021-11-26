// common
import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";

const broken = "data:image/png;base64,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";
const transparent = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

class ImageProps extends Props<undefined> {
	public readonly source: string;
	// events
	public readonly onError?: (callback: Image) => void;
	public readonly onLoaded?: (callback: Image) => void;

	constructor(args: Args<ImageProps>) {
		super(args);

		this.source = args.source;
		this.onError = args.onError;
		this.onLoaded = args.onLoaded;
	}
}

class Image extends Stateless<ImageProps> {
	protected postCSS() {
		return {};
	}
	protected preCSS() {
		return {};
	}
	protected build() {
		return (
			<img id={this.props.id} src={this.props.source}
				onLoad={(event) => {
					// @ts-ignore
					switch (event.target.src) {
						case transparent: {
							const observer: IntersectionObserver = new IntersectionObserver((entries) => {
								for (const entry of entries) {
									if (entry.isIntersecting) {
										// @ts-ignore
										event.target.src = this.props.source;
										// unobserve
										observer.disconnect();
										break;
									}
								}
							});
							// observe
							observer.observe(event.target as HTMLImageElement);
							break;
						}
					}
				}}
				onError={(event) => {
					// @ts-ignore
					event.target.src = broken;
				}}
				onDoubleClick={(event) => {
					// @ts-ignore
					event.target.src = transparent;
				}}
			/>
		);
	}
}

export default Image;
