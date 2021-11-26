// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { FlipFlop } from "@/app/common/props";
import { Stateful, Stateless, EventManager } from "@/app/common/framework";
// layout
import Row from "@/app/layout/row";
import Size from "@/app/layout/size";
import Text from "@/app/layout/text";
import Spacer from "@/app/layout/spacer";
import Offset from "@/app/layout/offset";
import Decoration from "@/app/layout/decoration";
// widgets
import Button from "@/app/widgets/button";

class PagingProps extends FlipFlop<undefined> {
	public readonly index: number;
	public readonly length: number;
	public readonly breakpoint: number;
	public readonly onPageChange?: (callback: number) => boolean;

	constructor(args: Args<PagingProps>) {
		super(args);

		this.index = args.index;
		this.length = args.length;
		this.breakpoint = args.breakpoint;
		this.onPageChange = args.onPageChange;
	}
}

class PagingState {
	public index: number;

	constructor(args: Args<PagingState>) {
		this.index = args.index;
	}
}

class Paging extends Stateful<PagingProps, PagingState> {
	protected create() {
		return new PagingState({ index: this.props.index });
	}
	protected postCSS() {
		return {};
	}
	protected preCSS() {
		return {};
	}
	protected events() {
		return [
			new EventManager(window, "keydown", (event: React.KeyboardEvent) => {
				if (this.props.toggle) {
					switch (event.key) {
						case "ArrowLeft": {
							this.jump(this.state.index - 1);
							break;
						}
						case "ArrowRight": {
							this.jump(this.state.index + 1);
							break;
						}
					}
				}
			})
		];
	}
	protected build() {
		return (
			<Decoration shadow={[[Color.DARK_100, 0, 0, 5, 0]]} background={{ color: Color.DARK_100 }}>
				<Size height={Unit(45)}>
					<Row id={"paging"}>
						<Spacer><section></section></Spacer>
						<Page onClick={() => { this.jump(0) }}>First</Page>
						{new Array(this.props.breakpoint.clamp(0, this.props.length)).fill(null).map((_, x) => {
							return (
								<Page key={x} color={(this.props.toggle ?? this.props.length) ? this.state.index === this.offset(x) ? Color.SPOTLIGHT : Color.TEXT_000 : Color.DARK_500}
									onClick={() => {
										this.jump(this.offset(x));
									}}
									children={this.offset(x + 1).toString()}
								/>
							);
						}) as never}
						<Page onClick={() => { this.jump(Infinity) }}>Last</Page>
						<Spacer><section></section></Spacer>
					</Row>
				</Size>
			</Decoration>
		);
	}
	public jump(index: number) {
		// clamping
		index = index.clamp(0, this.props.length - 1);

		if (this.props.toggle && this.props.length && (this.props.onPageChange?.(index) ?? true)) {
			this.setState({ ...this.state, index: index });
		}
	}
	public offset(value: number) {
		const breakout = (this.props.breakpoint / 2).truncate();
		const undeflow = (this.props.length > this.props.breakpoint);
		const viewport = (this.state.index > breakout && undeflow) ? (this.state.index - breakout).absolute() : 0;
		const overflow = (this.props.breakpoint + viewport);

		return value + viewport + ((overflow > this.props.length && undeflow) ? (this.props.length - overflow) : 0);
	}
}

class Page extends Stateless<Props & { color?: string, children: string, onClick: () => void; }> {
	protected preCSS() {
		return {};
	}
	protected postCSS() {
		return {};
	}
	protected build() {
		return (
			<Offset type={"padding"} left={Unit(7.5)} right={Unit(7.5)}>
				<Size type={"minimum"} width={Unit(50)}>
					<Button
						onMouseDown={(I) => {
							this.props.onClick();
						}}
						onMouseEnter={(I) => {
							I.style({ background: { color: Color.DARK_200 } });
						}}
						onMouseLeave={(I) => {
							I.style(null);
						}}
						children={<Text color={this.props.color ?? Color.TEXT_000}>{this.props.children}</Text>}
					/>
				</Size>
			</Offset>
		);
	}
}

export default Paging;
