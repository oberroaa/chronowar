import React from 'react';
import { getResourceIcon } from '../../types/gameData';
import type { ResourceItemProps } from './types';
import { ResourceItem as StyledResourceItem, ResourceIcon, ResourceValue } from './ResourcePanel.styles';

const ResourceItem: React.FC<ResourceItemProps> = ({ type, value, race }) => {
  return (
    <StyledResourceItem $race={race}>
      <ResourceIcon $type={type} $race={race}>
        {getResourceIcon(type)}
      </ResourceIcon>
      <ResourceValue $race={race}>{value.toLocaleString()}</ResourceValue>
    </StyledResourceItem>
  );
};

export default ResourceItem;