// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export const docsTpl = `import { ArgsTable } from '@storybook/addon-docs/blocks';
import { <%= name %> } from './<%= name %>';

# <%= name %>

### Usage

\`\`\`jsx
import { <%= name %> } from '@grafana/ui';

<<%= name %> />
\`\`\`

### Props
<ArgsTable of={<%= name %>} />
`;
