import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";

const transparent = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

class ImageProps extends Props<undefined> {
	public readonly source: string;
	// events
	public readonly onError?: () => void;
	public readonly onLoaded?: () => void;

	constructor(args: Args<ImageProps>) {
		super(args);

		this.source = args.source;
		// events
		this.onError = args.onError;
		this.onLoaded = args.onLoaded;
	}
}

class Image extends Stateless<Omit<ImageProps, ("color" | "image")>> {
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<img id={this.props.id} src={transparent}
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
					this.props.onLoaded?.();
				}}
				onError={(event) => {
					// @ts-ignore
					event.target.src = transparent;

					this.props.onError?.();
				}}
			/>
		);
	}
}

export default Image;
