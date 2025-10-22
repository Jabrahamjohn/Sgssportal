import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Input as AntdInput, InputNumber as AntdInputNumber } from 'antd';
// import { InputOTP as AntdInputOTP, InputOTPProps } from 'antd-input-otp';
import React from 'react';

import classNames from '../../utils/classnames';

import type { InputProps, InputNumberProps, InputRef } from 'antd';
import type { SearchProps } from 'antd/es/input';
import type { TextAreaRef, TextAreaProps } from 'antd/es/input/TextArea';
import type { OTPProps, OTPRef } from 'antd/es/input/OTP';

type InputType = InputProps & {
  error?: React.ReactNode;
  icon?: ({ className }: { className?: string }) => React.ReactNode;
  label?: React.ReactNode;
  notes?: React.ReactNode;
};

type InputNumberType = InputNumberProps & {
  error?: React.ReactNode;
  icon?: ({ className }: { className?: string }) => React.ReactNode;
  label?: React.ReactNode;
};

type InputOTPType = OTPProps & {
  error?: React.ReactNode;
  icon?: ({ className }: { className?: string }) => React.ReactNode;
  label?: React.ReactNode;
};

// type InputOTPType = InputOTPProps & {
// 	className?: string;
// 	error?: React.ReactNode
// 	label?: React.ReactNode;
// };

type InputSearchType = SearchProps & {
  error?: React.ReactNode;
  icon?: ({ className }: { className?: string }) => React.ReactNode;
  label?: React.ReactNode;
};

type TextAreaType = TextAreaProps & {
  error?: React.ReactNode;
  label?: React.ReactNode;
};

const inputClassName = 'form-input font-normal w-full';
const inputOTPClassName = 'border font-normal h-[50px] max-w-none rounded-[12px] w-full';

const Input = React.forwardRef<InputRef, InputType>(
  ({ className: propsClassName, error, label, icon: Icon, notes, required, ...props }, ref) => {
    const className = classNames(inputClassName, propsClassName || '');
    return (
      <>
        {label && (
          <label className={`${error ? '!text-red-500' : ''} form-field-label`} htmlFor={props.id}>
            {label}
            {required ? <span className="text-red-500"> *</span> : ''}
          </label>
        )}

        <AntdInput
          status={error ? 'error' : undefined}
          className={className}
          size="large"
          required={required}
          ref={ref}
          prefix={
            Icon ? (
              <span className="form-input-icon pr-2">
                <Icon />
              </span>
            ) : undefined
          }
          id={props.name}
          {...props}
        />

        {error && <span className="block !text-red-500 form-field-label">{error}</span>}
        {notes}
      </>
    );
  }
);

export const InputNumber = ({
  className: propsClassName,
  error,
  label,
  icon: Icon,
  required = false,
  ...props
}: InputNumberType) => {
  const className = classNames(inputClassName, propsClassName || '');
  return (
    <>
      {label && (
        <label className={`${error ? '!text-red-500' : ''} form-field-label`} htmlFor={props.id}>
          {label}
          {required ? <span className="text-red-500"> *</span> : ''}
        </label>
      )}

      <AntdInputNumber
        className={className}
        size="large"
        status={error ? 'error' : undefined}
        required={required}
        prefix={
          Icon ? (
            <span className="form-input-icon pr-2">
              <Icon />
            </span>
          ) : undefined
        }
        // ref={ref}
        {...props}
      />

      {error && <span className="block !text-red-500 form-field-label">{error}</span>}
    </>
  );
};

export const InputPassword = React.forwardRef<InputRef, InputType>(
  ({ className: propsClassName, error, label, icon: Icon, ...props }, ref) => {
    const className = classNames(inputClassName, propsClassName || '');
    return (
      <>
        {label && (
          <label className={`${error ? '!text-red-500' : ''} form-field-label`} htmlFor={props.id}>
            {label}
          </label>
        )}

        <AntdInput.Password
          className={className}
          status={error ? 'error' : undefined}
          size="large"
          iconRender={(visible) =>
            !visible ? (
              <span>
                <EyeOutlined />
              </span>
            ) : (
              <span>
                <EyeInvisibleOutlined />
              </span>
            )
          }
          required={false}
          prefix={
            Icon ? (
              <span className="form-input-icon pr-2">
                <Icon />
              </span>
            ) : undefined
          }
          ref={ref}
          {...props}
        />

        {error && <span className="block !text-red-500 form-field-label">{error}</span>}
      </>
    );
  }
);

export const InputSearch = React.forwardRef<InputRef, InputSearchType>(
  ({ className: propsClassName, error, label, icon: Icon, ...props }, ref) => {
    const className = classNames(inputClassName, propsClassName || '');
    return (
      <>
        {label && (
          <label className={`${error ? '!text-red-500' : ''} form-field-label`} htmlFor={props.id}>
            {label}
          </label>
        )}

        <AntdInput.Search
          status={error ? 'error' : undefined}
          className={className}
          required
          ref={ref}
          prefix={
            Icon ? (
              <span className="form-input-icon pr-2">
                <Icon />
              </span>
            ) : undefined
          }
          id={props.name}
          enterButton
          {...props}
        />

        {error && <span className="block !text-red-500 form-field-label">{error}</span>}
      </>
    );
  }
);

export const Textarea = React.forwardRef<TextAreaRef, TextAreaType>(
  ({ className: propsClassName, error, label, required, ...props }, ref) => {
    const className = classNames(inputClassName + ' rounded-[15px]', propsClassName || '');
    return (
      <>
        {label && (
          <label className={`${error ? '!text-red-500' : ''} form-field-label`} htmlFor={props.id}>
            {label}
            {required ? <span className="text-red-500"> *</span> : ''}
          </label>
        )}

        <AntdInput.TextArea
          autoSize={{
            minRows: 2,
            maxRows: 4,
          }}
          className={className}
          status={error ? 'error' : undefined}
          required={required}
          ref={ref}
          {...props}
        />

        {error && <span className="block !text-red-500 form-field-label">{error}</span>}
      </>
    );
  }
);

export const InputOTP = React.forwardRef<OTPRef, InputOTPType>(
  ({ error, label, className: propsClassName, ...props }, ref) => {
    const className = classNames(inputOTPClassName, propsClassName || '');
    return (
      <>
        {label && (
          <label className={`${error ? 'text-red-500' : ''} form-field-label`} htmlFor={props.id}>
            {label}
          </label>
        )}

        <AntdInput.OTP ref={ref} status={error ? 'error' : undefined} length={5} className={className} {...props} />
      </>
    );
  }
);

export default Input;
