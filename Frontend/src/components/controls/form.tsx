import {
	Form as AntdForm,
	type FormItemProps,
	type FormInstance as AntdFormInstance,
} from 'antd';
import React from 'react';

import type { FormProps } from 'antd';

type FormType = Omit<FormProps, 'children'> & {
	children: React.ReactNode;
	error?: Record<string, string | string[]>;
};

export type FormInstance = AntdFormInstance;

function Form({ form, error, ...props }: FormType) {
	const onValuesChange = React.useCallback(
		(values: any) => {
			if (form) {
				Object.keys(values).forEach((field) => {
					const error = form.getFieldError(field);
					if (!error.length) {
						return;
					}
					// Clear error message of field
					form.setFields([
						{
							name: field,
							errors: [],
						},
					]);
				});
			}
		},
		[form]
	);

	React.useEffect(() => {
		if (error && form) {
			const items = Object.entries(error);
			const errors: { name: string; errors: string[] }[] = [];

			items.forEach((item) => {
				const key = item[0];
				const value = item[1];

				if (form.getFieldInstance(key) && value) {
					errors.push({
						name: key,
						errors: Array.isArray(value) ? value : [value],
					});
				}
			});
			form.setFields(errors);
		}
	}, [error, form]);

	return (
		<AntdForm
			layout="vertical"
			scrollToFirstError={{
				scrollMode: 'if-needed',
				behavior: 'smooth',
			}}
			validateTrigger="onSubmit"
			form={form}
			onValuesChange={onValuesChange}
			{...props}
		/>
	);
}

function FormItem(props: FormItemProps) {
	return <AntdForm.Item {...props} />;
}

Form.ErrorList = AntdForm.ErrorList;
Form.Item = FormItem;
Form.List = AntdForm.List;
Form.useForm = AntdForm.useForm;
Form.useWatch = AntdForm.useWatch;

export default Form;
