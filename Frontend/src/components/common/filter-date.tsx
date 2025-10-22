import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import React from 'react';

import { Button, ButtonDropdown, Form, DatePicker } from '../controls';
import { useAlertContext } from '../../store/contexts';
import { getDate } from '../../utils';

type FormProps = {
	searchForm: { from?: string; to?: string };
	setSearchForm: React.Dispatch<
		React.SetStateAction<{ from?: string; to?: string }>
	>;
	resetForm: () => void;
	loading?: boolean;
	onClose: () => void;
};

const rules = [{ required: true, message: 'This field is required ' }];

export function FilterDateForm({
	resetForm,
	searchForm,
	setSearchForm,
	loading = false,
	onClose,
}: FormProps) {
	const [form] = Form.useForm();

	const { open: showAlert } = useAlertContext();

	// Keep the form up-to-date after reset
	React.useEffect(() => {
		form.setFieldsValue({
			from: searchForm.from ? getDate(searchForm.from, 'dayjs') : undefined,
			to: searchForm.to ? getDate(searchForm.to, 'dayjs') : undefined,
		});
	}, [form, searchForm]);

	return (
		<Form
			form={form}
			onFinish={(values: { from: dayjs.Dayjs; to: dayjs.Dayjs }) => {
				if (values.to.isBefore(values.from)) {
					showAlert({
						type: 'error',
						message: 'Date is improperly configured',
					});
				} else {
					const input = {
						from: values.from.format('YYYY-MM-DD'),
						to: values.to.format('YYYY-MM-DD'),
					};
					setSearchForm(input);
					onClose();
				}
			}}
			initialValues={{
				from: getDate(searchForm?.from, 'dayjs') as dayjs.Dayjs,
				to: getDate(searchForm?.to, 'dayjs') as dayjs.Dayjs,
			}}
			className="bg-white p-2 pb-1 rounded-md w-full"
			disabled={loading}
		>
			<div className="mb-2 w-full">
				<Form.Item name="from" rules={rules}>
					<DatePicker disabled={loading} label="From" />
				</Form.Item>
			</div>

			<div className="mb-2 w-full">
				<Form.Item name="to" rules={rules}>
					<DatePicker disabled={loading} label="To" />
				</Form.Item>
			</div>
			<div className="flex flex-wrap gap-2 justify-between mb-3 mt-4 w-full">
				<div className="w-full md:w-[45%]">
					<Button>Filter</Button>
				</div>
				<div className="w-full md:w-[45%]">
					<Button
						danger
						onClick={() => {
							resetForm();
							onClose();
						}}
						htmlType="reset"
					>
						Reset
					</Button>
				</div>
			</div>
		</Form>
	);
}

function FilterDate({ form }: { form: Omit<FormProps, 'onClose'> }) {
	const [open, setOpen] = React.useState(false);

	return (
		<ButtonDropdown
			dropdown={{
				open,
				onOpenChange: (open) => {
					// (open, info);
					setOpen(open);
				},
				dropdownRender: () => (
					<FilterDateForm {...form} onClose={() => setOpen(false)} />
				),
			}}
			button={{
				children: 'Date Filter',
				type: 'default',
				icon: CalendarOutlined,
			}}
		/>
	);
}

export default FilterDate;
