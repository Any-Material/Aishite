// common
import { Stateless } from "@/app/common/framework";
// layout
import Center from "@/app/layout/center";
import Container from "@/app/layout/container";

/** Shorthand combination of `Container` and `Center`. */
class Button extends Stateless<Container["props"]> {
	protected preCSS() {
		return {};
	}
	protected postCSS() {
		return {};
	}
	protected build() {
		return (
			<Container {...this.props}>
				<Center x={true} y={true} children={this.props.children as SingleElement}/>
			</Container>
		);
	}
}

export default Button;
