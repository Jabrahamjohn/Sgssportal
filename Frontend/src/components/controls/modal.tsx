import { Modal as AntdModal, type ModalProps } from 'antd';

import { classNames } from '../../utils';

type ModalType = ModalProps;

function Modal({ children, className, ...props }: ModalType) {
  return (
    <AntdModal
      className={classNames('overflow-x-hidden w-full', className || '')}
      destroyOnHidden
      footer={null}
      {...props}
    >
      {children}
    </AntdModal>
  );
}

Modal.confirm = AntdModal.confirm;

export default Modal;
