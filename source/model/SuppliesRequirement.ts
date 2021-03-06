import { observable } from 'mobx';

import { DataItem, Place, Contact, User, service, PageData } from '../service';

export interface Supplies {
    name: string;
    type: 'face' | 'leg' | 'disinfection' | 'device' | 'other';
    remark: string;
    count: number;
}

export interface SuppliesRequirement extends DataItem, Place {
    hospital?: string;
    url?: string;
    supplies?: Supplies[];
    contacts?: Contact[];
    remark?: string;
    creator?: User;
}

export class SuppliesRequirementModel {
    pageIndex = 0;

    pageSize = 10;

    totalCount = 0;

    @observable
    list: SuppliesRequirement[] = [];

    async getNextPage(
        filter: {
            province?: string;
            city?: string;
            district?: string;
        } = {}
    ) {
        if (this.pageIndex && this.list.length === this.totalCount) return;

        const {
            body: { count, data }
        } = await service.get<PageData<SuppliesRequirement>>(
            '/supplies/requirement?' +
                new URLSearchParams({
                    ...filter,
                    pageIndex: this.pageIndex + 1 + '',
                    pageSize: this.pageSize + ''
                })
        );
        this.pageIndex++, (this.totalCount = count);

        this.list = this.list.concat(data);

        return data;
    }

    async update(data: SuppliesRequirement, id?: string) {
        if (!id) {
            const { body } = await service.post<SuppliesRequirement>(
                '/supplies/requirement',
                data
            );

            this.list = [body].concat(this.list);
        } else {
            const { body } = await service.put<SuppliesRequirement>(
                    '/supplies/requirement/' + id,
                    data
                ),
                index = this.list.findIndex(({ objectId }) => objectId === id);

            this.list[index] = body;
        }
    }

    async getOne(id: string) {
        const { body } = await service.get<SuppliesRequirement>(
            '/supplies/requirement/' + id
        );
        return body;
    }

    async delete(id: string) {
        await service.delete('/supplies/requirement/' + id);

        this.list = this.list.filter(({ objectId }) => objectId !== id);
    }
}
