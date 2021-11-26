declare interface Props {
	id?: string;
	class?: Record<string, boolean>;
	children?: Array<JSX.Element> | JSX.Element | string;
}
