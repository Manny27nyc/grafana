// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { monacoTypes } from '@grafana/ui';

// Stub for monacoTypes.editor.ITextModel. Only implements the parts that are used in cloudwatch sql
function TextModel(value: string) {
  return {
    getValue: function (eol?: monacoTypes.editor.EndOfLinePreference, preserveBOM?: boolean): string {
      return value;
    },
    getValueInRange: function (range: monacoTypes.IRange, eol?: monacoTypes.editor.EndOfLinePreference): string {
      const lines = value.split('\n');
      const line = lines[range.startLineNumber - 1];
      return line.trim().slice(range.startColumn === 0 ? 0 : range.startColumn - 1, range.endColumn - 1);
    },
    getLineLength: function (lineNumber: number): number {
      const lines = value.split('\n');
      return lines[lineNumber - 1].trim().length;
    },
  };
}

export default TextModel;
