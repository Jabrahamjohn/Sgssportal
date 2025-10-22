import { Alert as AntdAlert, type AlertProps } from "antd";

type AlertType = Omit<AlertProps, "type"> & {
	type: AlertProps["type"] | "danger";
};

function Alert({ type, ...props }: AlertType) {
	return (
		<AntdAlert
			closable={false}
			showIcon
			type={type === "danger" ? "error" : type}
			{...props}
		/>
	);
}

export default Alert;
