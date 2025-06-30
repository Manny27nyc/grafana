// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { DataTransformerConfig } from '@grafana/data';

export interface TransformationsEditorTransformation {
  transformation: DataTransformerConfig;
  id: string;
}
