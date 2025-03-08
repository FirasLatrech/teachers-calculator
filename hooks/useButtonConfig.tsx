import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define button configuration types
export interface ButtonConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

// Define point value configuration type
export interface PointConfig {
  customized: boolean;
  values: (number | null)[][];
  gridSize: number; // 6, 9, 12, or 16
}

// Default button configuration
export const defaultButtonConfig: ButtonConfig[] = [
  { id: 'reset', name: 'Reset', enabled: true, order: 0 },
  { id: 'undo', name: 'Undo', enabled: true, order: 1 },
  { id: 'subtract', name: 'Subtract Last', enabled: true, order: 2 },
  { id: 'add', name: 'Add Last', enabled: true, order: 3 },
];

// Helper function to generate default grid values based on size
export const generateDefaultGrid = (size: number): (number | null)[][] => {
  // Default 20 values (5x4 grid)
  if (size === 20) {
    return [
      [0.25, 0.5, 0.75, 1.0],
      [1.25, 1.5, 1.75, 2.0],
      [2.25, 2.5, 2.75, 3.0],
      [3.25, 3.5, 3.75, 4.0],
      [4.25, 4.5, 4.75, 5.0],
    ];
  }

  // 16 values (4x4 grid)
  if (size === 16) {
    return [
      [0.25, 0.5, 0.75, 1.0],
      [1.5, 2.0, 2.5, 3.0],
      [3.5, 4.0, 4.5, 5.0],
      [5.5, 6.0, 7.5, 10.0],
    ];
  }

  // 12 values (3x4 grid)
  if (size === 12) {
    return [
      [0.5, 1.0, 1.5, 2.0],
      [2.5, 3.0, 4.0, 5.0],
      [6.0, 7.0, 8.0, 10.0],
    ];
  }

  // 9 values (3x3 grid)
  if (size === 9) {
    return [
      [0.5, 1.0, 1.5],
      [2.0, 3.0, 4.0],
      [5.0, 7.5, 10.0],
    ];
  }

  // 6 values (2x3 grid)
  if (size === 6) {
    return [
      [1.0, 2.0, 3.0],
      [5.0, 7.0, 10.0],
    ];
  }

  // Default to 20 values if size is not recognized
  return [
    [0.25, 0.5, 0.75, 1.0],
    [1.25, 1.5, 1.75, 2.0],
    [2.25, 2.5, 2.75, 3.0],
    [3.25, 3.5, 3.75, 4.0],
    [4.25, 4.5, 4.75, 5.0],
  ];
};

// Default point values configuration
export const defaultPointConfig: PointConfig = {
  customized: false,
  gridSize: 20, // Default to 20 buttons (5x4)
  values: generateDefaultGrid(20),
};

// Create context
interface ButtonConfigContextType {
  buttonConfig: ButtonConfig[];
  setButtonConfig: React.Dispatch<React.SetStateAction<ButtonConfig[]>>;
  toggleButton: (id: string) => void;
  moveButtonUp: (index: number) => void;
  moveButtonDown: (index: number) => void;
  resetToDefaults: () => void;
  isConfigMode: boolean;
  setConfigMode: (mode: boolean) => void;
  pointConfig: PointConfig;
  updatePointValue: (
    rowIndex: number,
    colIndex: number,
    value: number | null
  ) => void;
  resetPointValues: () => void;
  isEditingPoints: boolean;
  setEditingPoints: (editing: boolean) => void;
  changeGridSize: (size: number) => void;
}

const ButtonConfigContext = createContext<ButtonConfigContextType | undefined>(
  undefined
);

// Create provider
export const ButtonConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [buttonConfig, setButtonConfig] =
    useState<ButtonConfig[]>(defaultButtonConfig);
  const [pointConfig, setPointConfig] =
    useState<PointConfig>(defaultPointConfig);
  const [isConfigMode, setConfigMode] = useState(false);
  const [isEditingPoints, setEditingPoints] = useState(false);

  // Load configurations on first render
  useEffect(() => {
    loadConfigurations();
  }, []);

  // Save configurations whenever they change
  useEffect(() => {
    saveConfigurations();
  }, [buttonConfig, pointConfig]);

  // Load configurations from AsyncStorage
  const loadConfigurations = async () => {
    try {
      const settings = await AsyncStorage.getItem('calculatorSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);

        // Load button configuration
        if (parsedSettings.buttonConfig) {
          setButtonConfig(parsedSettings.buttonConfig);
        }

        // Load point configuration
        if (parsedSettings.pointConfig) {
          setPointConfig(parsedSettings.pointConfig);
        }
      }
    } catch (error) {
      console.error('Failed to load configurations:', error);
    }
  };

  // Save configurations to AsyncStorage
  const saveConfigurations = async () => {
    try {
      // Get current settings
      const settingsStr = await AsyncStorage.getItem('calculatorSettings');
      const settings = settingsStr ? JSON.parse(settingsStr) : {};

      // Update with new configurations
      settings.buttonConfig = buttonConfig;
      settings.pointConfig = pointConfig;

      // Save back to AsyncStorage
      await AsyncStorage.setItem(
        'calculatorSettings',
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Failed to save configurations:', error);
    }
  };

  // Toggle button enabled state
  const toggleButton = (id: string) => {
    setButtonConfig((prev) =>
      prev.map((button) =>
        button.id === id ? { ...button, enabled: !button.enabled } : button
      )
    );
  };

  // Move button up in order
  const moveButtonUp = (index: number) => {
    if (index === 0) return;

    const newConfig = [...buttonConfig];
    const temp = newConfig[index].order;
    newConfig[index].order = newConfig[index - 1].order;
    newConfig[index - 1].order = temp;

    // Sort by order
    newConfig.sort((a, b) => a.order - b.order);
    setButtonConfig(newConfig);
  };

  // Move button down in order
  const moveButtonDown = (index: number) => {
    if (index === buttonConfig.length - 1) return;

    const newConfig = [...buttonConfig];
    const temp = newConfig[index].order;
    newConfig[index].order = newConfig[index + 1].order;
    newConfig[index + 1].order = temp;

    // Sort by order
    newConfig.sort((a, b) => a.order - b.order);
    setButtonConfig(newConfig);
  };

  // Update a specific point value
  const updatePointValue = (
    rowIndex: number,
    colIndex: number,
    value: number | null
  ) => {
    if (
      rowIndex < 0 ||
      rowIndex >= pointConfig.values.length ||
      colIndex < 0 ||
      colIndex >= pointConfig.values[0].length
    ) {
      return;
    }

    const newValues = [...pointConfig.values.map((row) => [...row])];
    newValues[rowIndex][colIndex] = value;

    setPointConfig({
      ...pointConfig,
      customized: true,
      values: newValues,
    });
  };

  // Change the grid size
  const changeGridSize = (size: number) => {
    const validSizes = [6, 9, 12, 16, 20];
    if (!validSizes.includes(size)) {
      console.error(
        `Invalid grid size: ${size}. Must be one of ${validSizes.join(', ')}`
      );
      return;
    }

    setPointConfig({
      customized: false, // Reset customization flag when changing size
      gridSize: size,
      values: generateDefaultGrid(size),
    });
  };

  // Reset all configurations to defaults
  const resetToDefaults = () => {
    setButtonConfig(defaultButtonConfig);
    setPointConfig(defaultPointConfig);
    setConfigMode(false);
    setEditingPoints(false);
  };

  // Reset just the point values
  const resetPointValues = () => {
    setPointConfig({
      ...pointConfig,
      customized: false,
      values: generateDefaultGrid(pointConfig.gridSize),
    });
    setEditingPoints(false);
  };

  return (
    <ButtonConfigContext.Provider
      value={{
        buttonConfig,
        setButtonConfig,
        toggleButton,
        moveButtonUp,
        moveButtonDown,
        resetToDefaults,
        isConfigMode,
        setConfigMode,
        pointConfig,
        updatePointValue,
        resetPointValues,
        isEditingPoints,
        setEditingPoints,
        changeGridSize,
      }}
    >
      {children}
    </ButtonConfigContext.Provider>
  );
};

// Custom hook to use the context
export const useButtonConfig = () => {
  const context = useContext(ButtonConfigContext);
  if (context === undefined) {
    throw new Error(
      'useButtonConfig must be used within a ButtonConfigProvider'
    );
  }
  return context;
};
