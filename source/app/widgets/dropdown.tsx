// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";
// layout
import Row from "@/app/layout/row";
import Size from "@/app/layout/size";
import Form from "@/app/layout/form";
import Center from "@/app/layout/center";
import Column from "@/app/layout/column";
import Offset from "@/app/layout/offset";
import Scroll from "@/app/layout/scroll";
import Spacer from "@/app/layout/spacer";
import Container from "@/app/layout/container";
// icons
import Close from "@/app/icons/close";

class DropdownProps extends Props<undefined> {
	constructor(args: Args<DropdownProps>) {
		super(args);
	}
}

class DropdownState {
	constructor(args: Args<DropdownState>) { }
}

class Dropdown extends Stateful<DropdownProps, DropdownState> {
	protected create() {
		throw new Error("Method not implemented.");
	}
	protected postCSS() {
		throw new Error("Method not implemented.");
	}
	protected preCSS() {
		throw new Error("Method not implemented.");
	}
	protected build() {
		return (
			<Row>
				<Offset type={"margin"} left={Unit(10)} right={Unit(10)}>
					<Form id={"query"} toggle={!this.state.gallery.empty} fallback={this.state.query.length ? this.state.query : "language:all"}
						onType={(text) => {
							return true;
						}}
						onSubmit={(text) => {
							// reset gallery
							this.setState({ ...this.state, index: 0, query: text, length: 0, gallery: [] }, () => {
								// update gallery
								this.gallery(this.state.query, this.state.index);
								// rename
								navigator.rename(this.state.query);
							});
						}}
					/>
				</Offset>
				<Size width={Unit(50)}>
					<Center x={true} y={true}>
						<Close color={Color.DARK_500}
							onMouseDown={(I) => {
								// reset gallery
								this.setState({ ...this.state, index: 0, query: "language:all", length: 0, gallery: [] }, () => {
									// update gallery
									this.gallery(this.state.query, this.state.index);
									// rename
									navigator.rename(this.state.query);
								});
							}}
							onMouseEnter={(I) => {
								I.style(Color.TEXT_000);
							}}
							onMouseLeave={(I) => {
								I.style(null);
							}}
						/>
					</Center>
				</Size>
			</Row>
		);
	}

}
