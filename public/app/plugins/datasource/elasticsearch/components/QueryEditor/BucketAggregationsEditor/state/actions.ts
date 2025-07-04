// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { createAction } from '@reduxjs/toolkit';
import { BucketAggregation, BucketAggregationType, BucketAggregationWithField } from '../aggregations';

export const addBucketAggregation = createAction<BucketAggregation['id']>('@bucketAggs/add');
export const removeBucketAggregation = createAction<BucketAggregation['id']>('@bucketAggs/remove');
export const changeBucketAggregationType = createAction<{
  id: BucketAggregation['id'];
  newType: BucketAggregationType;
}>('@bucketAggs/change_type');
export const changeBucketAggregationField = createAction<{
  id: BucketAggregation['id'];
  newField: BucketAggregationWithField['field'];
}>('@bucketAggs/change_field');
export const changeBucketAggregationSetting = createAction<{
  bucketAgg: BucketAggregation;
  settingName: string;
  newValue: any;
}>('@bucketAggs/change_setting');
