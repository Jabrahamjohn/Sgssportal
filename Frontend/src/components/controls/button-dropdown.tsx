import Button, { type ButtonType } from './button';
import Dropdown, { type DropdownType } from './dropdown';

type ButtonDropdownType = {
  button?: ButtonType;
  dropdown?: DropdownType;
};

function ButtonDropdown({ button, dropdown }: ButtonDropdownType) {
  return (
    <Dropdown placement="bottomLeft" trigger={['click']} {...dropdown}>
      <Button iconClass="" type="default" {...button} />
    </Dropdown>
  );
}

export default ButtonDropdown;
