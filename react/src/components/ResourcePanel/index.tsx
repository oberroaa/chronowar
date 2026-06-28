import React from 'react';
import type { ResourcePanelComponentProps } from './types';
import { ResourcesContainer } from './ResourcePanel.styles';
import ResourceItem from './ResourceItem';

// Componente principal del panel de recursos
const ResourcePanel: React.FC<ResourcePanelComponentProps> = ({ 
  resources,
  race = 'valdari' // Valor por defecto
}) => {  
  const orderedResources = ['gold', 'supplies', 'food', 'chrono'];

  return (
    <ResourcesContainer $race={race}>
      {orderedResources.map((type) => (
        <ResourceItem 
          key={type} 
          type={type as any} 
          value={resources[type as keyof typeof resources] || 0} 
          race={race} 
        />
      ))}
    </ResourcesContainer>
  );
};

export default ResourcePanel;