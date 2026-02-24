import { AxiosResponse } from 'axios';
import { AbiResponse } from './types';

const axios = require('axios').default;
const fs = require('fs');

export const TN_EP = 'https://testnet.rockerone.io';
export const MN_EP = 'https://api.rockerone.io';

export async function loadAbi(
  account_name: string,
  rpcUrl: string
): Promise<AbiResponse | null> {
  return axios({
    method: 'post',
    url: `${rpcUrl}/v1/chain/get_abi`,
    data: { account_name },
  }).then((data: AxiosResponse) => ({
    account_name,
    abi: { ...data.data.abi },
  }));
}

export async function loadLocalAbi(
  account_name: string,
  abi_path: string
): Promise<AbiResponse | null> {
  return new Promise((resolve, reject) => {
    fs.readFile(abi_path, 'utf8', (error: any, data: string) => {
      if (error) {
        return reject(null);
      }
      return resolve({
        account_name,
        abi: JSON.parse(data),
      });
    });
  });
}
