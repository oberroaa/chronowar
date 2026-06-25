export const formatName = (name: string) => {
  if (!name) return '';
  // Reemplazar guiones bajos por espacios
  let formatted = name.replace(/_/g, ' ');
  // Añadir un espacio antes de las letras mayúsculas (excepto la primera)
  // Esto arregla CamelCase como BastionAlborada -> Bastion Alborada
  formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');
  return formatted.trim();
};
