import { api } from '../../config/api';

export async function getGeneralLimits() {
  const { data } = await api.get('settings/general_limits/');
  return data; // { annual_limit, fund_share_percent, clinic_outpatient_percent, ...}
}
