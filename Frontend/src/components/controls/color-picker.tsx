import {
	ColorPicker as AntdColorPicker,
	type ColorPickerProps,
	type GetProp,
} from 'antd';

type ColorPickerType = ColorPickerProps & {
	error?: string;
	label?: React.ReactNode;
	id?: string;
	required?: boolean;
};

export type ColorValueType = Extract<
	GetProp<ColorPickerProps, 'value'>,
	string | { cleared: any }
>;

export default function ColorPicker({
	error,
	label,
	id,
	required,
	...props
}: ColorPickerType) {
	return (
		<>
			{label && (
				<label
					className={`${error ? '!text-red-500' : ''} form-field-label`}
					htmlFor={id}
				>
					{label}
					{required ? <span className="text-red-500"> *</span> : ''}
				</label>
			)}
			<AntdColorPicker {...props} />
			{error && (
				<span className="block !text-red-500 form-field-label">{error}</span>
			)}
		</>
	);
}
