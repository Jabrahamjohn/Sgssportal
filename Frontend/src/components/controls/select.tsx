import { CaretDownOutlined } from '@ant-design/icons';
import { Select as AntdSelect } from 'antd';

import type { SelectProps } from 'antd';

import classNames from '../../utils/classnames';

export type SelectType = SelectProps & {
  error?: React.ReactNode;
  label?: React.ReactNode;
  name?: string;
  notes?: React.ReactNode;
  required?: boolean;
};

const inputClassName = 'form-input font-normal w-full';

function Select({ className: propClassName, label, error, onSelect, notes, required, ...props }: SelectType) {
  const className = classNames(inputClassName, propClassName || '');

  return (
    <>
      {label && (
        <label className={`${error ? '!text-red-500' : ''} form-field-label`} htmlFor={props.id}>
          {label}
          {required ? <span className="text-red-500"> *</span> : ''}
        </label>
      )}
      <AntdSelect
        className={className}
        filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
        size="large"
        status={error ? 'error' : undefined}
        style={{ width: '100%' }}
        suffixIcon={<CaretDownOutlined />}
        {...props}
        onSelect={(value, option) => {
          if (onSelect) onSelect(value, option);
        }}
      />
      {error && <span className="block !text-red-500 form-field-label">{error}</span>}
      {notes}
    </>
  );
}

export default Select;
