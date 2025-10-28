import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ScriptableContext,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { Empty, Flex } from 'antd';

// import { ExportButton } from './export-button';
// import { ExportIcon } from '../../icons';
// import { useRef } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ChartType = {
  chartData: any[];
};

const Chart = ({ chartData }: ChartType) => {
  // const chartRef = useRef<any>(null);

  // const exportChart = () => {
  //   if (chartRef.current) {
  //     const url = chartRef.current.toBase64Image();
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = 'transaction-chart.png';
  //     link.click();
  //   }
  // };

  const getMaxValue = (arr: number[]): number => Math.max(...arr, 0);

  const datasetValues = chartData;

  const data: ChartData<'line'> = {
    labels: chartData.map((label) => {
      return label.date;
    }),
    datasets: [
      {
        label: 'Claims Report',
        data: datasetValues.map((d) => d.amount),
        borderColor: 'hsla(153, 61%, 29%, 1)',
        borderWidth: 1.5,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 280);
          gradient.addColorStop(0, 'hsl(239, 100%, 87%, 0.5)');
          gradient.addColorStop(1, 'hsl(239, 100%, 87%, 0)');
          return gradient;
        },
        pointBackgroundColor: 'hsl(238, 48%, 16%, 1)',
        pointBorderColor: 'white',
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: 'white',
        pointHoverBackgroundColor: 'hsl(238, 48%, 16%, 1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) =>
            items.map((item) => {
              return item.label;
            }),

          label: (item) => {
            return `${item.raw?.toLocaleString()} claims`;
          },
        },
        backgroundColor: 'hsl(238, 48%, 16%, 1)',
        titleColor: 'white',
        titleFont: {
          family: 'Inter',
          size: 16,
          weight: 400,
        },
        bodyColor: '#E4E4E7',
        // borderColor: '#E4E4E7',
        usePointStyle: true,
        // borderWidth: 1,
        // boxWidth: 50,
        caretPadding: 16,
        xAlign: 'center',
        yAlign: 'bottom',
        bodyFont: { family: 'Inter', weight: 'normal', size: 14 },
        bodyAlign: 'center',
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
        titleAlign: 'center',
        displayColors: false,
        // boxWidth: 400,
      },
    },
    hover: { mode: 'index', intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: 'hsla(155, 5%, 44%, 1)',
          font: { family: 'Inter', size: 13, weight: 500 },
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: 'hsla(155, 5%, 44%, 1)',
          font: { family: 'Inter', size: 13, weight: 500 },
          callback: (value) => {
            if (Number(value) >= 1000) {
              const formatted = (Number(value) / 1000).toFixed(
                Number(value) % 1000 === 0 ? 0 : 1
              );
              return `${formatted}k`;
            }
            return value.toString();
          },
        },
        min: 0,
        max: getMaxValue(datasetValues) + 50,
      },
    },
  };

  return (
    <>
      {/* <div className='px-5 mb-6 lg:px-6'>
        <ExportButton
          icon={<ExportIcon className='text-[23px]' />}
          text='Export PDF'
          className='rounded-md'
          // onClick={exportChart}
        />
      </div> */}
      <div style={{ width: '100%', height: '85%' }}>
        {chartData.length > 1 ? (
          <Line data={data} options={options} />
        ) : (
          <Flex
            vertical
            justify='center'
            align='center'
            className='h-full w-full'
            gap={5}
          >
            <Empty
              description={
                <span>
                  No claims made for the year <b>{dayjs().format('YYYY')}</b>
                </span>
              }
            />
          </Flex>
        )}
        {/* <Line ref={chartRef} data={data} options={options} /> */}
      </div>
    </>
  );
};

export default Chart;
