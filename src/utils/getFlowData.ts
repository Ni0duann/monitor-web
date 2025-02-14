import { getFlowData } from '@/api';
import { FlowDataParams } from '@/interface';

// 定义 PvUvData 类型
type PvUvData = {
    pv1: number;
    uv1: number;
    pv2: number;
    uv2: number;
    pv3: number;
    uv3: number;
    pvTotal: number;
    uvTotal: number;
};

class FlowDataFetcher {
    private pagePaths: string[] = ['page1', 'page2', 'page3', 'total'];
    private dataTypes: ('pv' | 'uv')[] = ['pv', 'uv'];

    async fetchAll(rangeTime?: number): Promise<PvUvData> {
        const result: PvUvData = {
            pv1: 0,
            uv1: 0,
            pv2: 0,
            uv2: 0,
            pv3: 0,
            uv3: 0,
            pvTotal: 0,
            uvTotal: 0
        };

        for (const pagePath of this.pagePaths) {
            for (const dataType of this.dataTypes) {
                const params: FlowDataParams = {
                    pagePath,
                    dataType,
                    rangeTime
                };

                try {
                    const response = await getFlowData(params);
                    if (response.success) {
                        const count = response.totalCount;
                        if (pagePath === 'page1') {
                            if (dataType === 'pv') {
                                result.pv1 = count;
                            } else {
                                result.uv1 = count;
                            }
                        } else if (pagePath === 'page2') {
                            if (dataType === 'pv') {
                                result.pv2 = count;
                            } else {
                                result.uv2 = count;
                            }
                        } else if (pagePath === 'page3') {
                            if (dataType === 'pv') {
                                result.pv3 = count;
                            } else {
                                result.uv3 = count;
                            }
                        } else if (pagePath === 'total') {
                            if (dataType === 'pv') {
                                result.pvTotal = count;
                            } else {
                                result.uvTotal = count;
                            }
                        }
                    }
                } catch (error) {
                    console.error(`获取 ${pagePath} 的 ${dataType} 流量数据时出错:`, error);
                }
            }
        }

        return result;
    }
}



export default FlowDataFetcher;
