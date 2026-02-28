import React from 'react';
import type { ResourcePanelComponentProps } from './types';
import { ResourcesContainer } from './ResourcePanel.styles';
import ResourceItem from './ResourceItem';

// Componente principal del panel de recursos
const ResourcePanel: React.FC<ResourcePanelComponentProps> = ({ 
  resources,
  race = 'valdari' // Valor por defecto
}) => {  
  return (
    <ResourcesContainer $race={race}>
      {Object.entries(resources).map(([type, value]) => (
        <ResourceItem 
          key={type} 
          type={type as any} 
          value={value} 
          race={race} 
        />
      ))}
    </ResourcesContainer>
  );
};

export default ResourcePanel;