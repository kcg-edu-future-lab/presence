import { Box, Paper, styled, Tab, Tabs } from '@mui/material';
import React, { PropsWithChildren, Children } from 'react';

const StyledPaper = styled(Paper)(() => ({
    flexGrow: 1
}));

interface Props extends PropsWithChildren{
  value: number;
  index: number;
  forceMount?: boolean;
}
function TabPanel({ children, value, index, forceMount=true, ...other }: Props) {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {(forceMount || value === index) && (
          <Box p={3}>
            {children}
          </Box>
        )}
      </div>
    );
}

interface CustomTabsProps extends PropsWithChildren{
  labels: string[],
}
export function CustomTabs({labels, children}: CustomTabsProps) {
  const [value, setValue] = React.useState(0);
  const handleChange: (event: React.SyntheticEvent, value: any)=>void = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
        <StyledPaper>
            <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable" scrollButtons="auto"
            >
                {labels.map((label, li) => <Tab key={li} label={label}></Tab>)}
            </Tabs>
        </StyledPaper>
        {Children.map(children, (child: any, index: number) => 
            <TabPanel value={value} index={index}>{child}</TabPanel>)
        }
    </div>
  );
}
