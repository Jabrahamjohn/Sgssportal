import { CaretRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';
import { Calendar as AntdCalendar, type CalendarProps } from 'antd';
import { type HeaderRender } from 'antd/es/calendar/generateCalendar';
import { Dayjs } from 'dayjs';

type CalendarType = CalendarProps<Dayjs>;

const CustomHeaderRender: HeaderRender<Dayjs> = ({ value, onChange }) => {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="flex items-center gap-0.5">
        <DoubleLeftOutlined
          className="cursor-pointer"
          tabIndex={0}
          role="button"
          style={{ fontSize: '12px' }}
          onClick={() => {
            onChange(value.subtract(1, 'year'));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onChange(value.subtract(1, 'year'));
            }
          }}
        />
        <CaretRightOutlined
          className="cursor-pointer rotate-180"
          tabIndex={0}
          role="button"
          style={{ fontSize: '12px' }}
          onClick={() => {
            onChange(value.subtract(1, 'month'));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onChange(value.subtract(1, 'month'));
            }
          }}
        />
      </span>
      <span style={{ fontSize: '14px' }}>{value.format('MMM YYYY')}</span>
      <span className="flex items-center gap-0.5">
        <CaretRightOutlined
          className="cursor-pointer"
          tabIndex={0}
          role="button"
          style={{ fontSize: '12px' }}
          onClick={() => {
            onChange(value.add(1, 'month'));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onChange(value.add(1, 'month'));
            }
          }}
        />
        <DoubleLeftOutlined
          className="cursor-pointer rotate-180"
          tabIndex={0}
          role="button"
          style={{ fontSize: '12px' }}
          onClick={() => {
            onChange(value.add(1, 'year'));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onChange(value.add(1, 'year'));
            }
          }}
        />
      </span>
    </div>
  );
};

export default function Calendar(props: CalendarType) {
  return <AntdCalendar fullscreen={false} headerRender={CustomHeaderRender} {...props} />;
}
