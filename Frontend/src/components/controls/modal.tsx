// Frontend/src/components/controls/modal.tsx
import { Modal as AntdModal, type ModalProps } from "antd";
import { classNames } from "../../utils";

type Props = ModalProps & {
  onClose?: () => void; // compatibility for your codebase
};

function Modal({ children, className, onClose, onCancel, ...props }: Props) {
  return (
    <AntdModal
      className={classNames("overflow-x-hidden w-full", className || "")}
      destroyOnClose
      footer={null}
      onCancel={onCancel ?? onClose}
      {...props}
    >
      {children}
    </AntdModal>
  );
}

Modal.confirm = AntdModal.confirm;
export default Modal;
