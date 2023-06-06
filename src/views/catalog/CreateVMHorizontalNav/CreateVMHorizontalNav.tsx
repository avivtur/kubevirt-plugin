import React, { FC, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import CreateFromInstanceType from '@catalog/CreateFromInstanceTypes/CreateFromInstanceType';
import EnableInstanceTypeTechPreviewModal from '@catalog/EnableInstanceTypeTechPreviewModal/EnableInstanceTypeTechPreviewModal';
import TemplatesCatalog from '@catalog/templatescatalog/TemplatesCatalog';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack, StackItem, Tab, Tabs, Title } from '@patternfly/react-core';
import { CatalogIcon, ImageIcon } from '@patternfly/react-icons';

import CreateVMTabTitle from './components/CreateVMTabTitle/CreateVMTabTitle';
import { CREATE_VM_TAB } from './constants';

import './CreateVMHorizontalNav.scss';

const CreateVMHorizontalNav: FC<RouteComponentProps<{ ns: string }>> = ({
  history,
  location,
  match,
}) => {
  const { t } = useKubevirtTranslation();

  const [currentTab, setCurrentTab] = useState<CREATE_VM_TAB>(
    location.pathname.endsWith(CREATE_VM_TAB.INSTANCE_TYPES)
      ? CREATE_VM_TAB.INSTANCE_TYPES
      : CREATE_VM_TAB.CATALOG,
  );

  const handleTabClick = (
    event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent,
    tabIndex: CREATE_VM_TAB,
  ) => {
    setCurrentTab(tabIndex);
    history.push(
      `/k8s/${
        match?.params?.ns ? `ns/${match?.params?.ns}` : ALL_NAMESPACES
      }/templatescatalog${tabIndex}`,
    );
  };

  return (
    <div className="create-vm-horizontal-nav">
      <div className="pf-c-page__main-breadcrumb">
        <Stack hasGutter className="co-m-pane__heading">
          <StackItem>
            <Title headingLevel="h1">{t('Create new VirtualMachine')}</Title>
          </StackItem>
          <StackItem>{t('Select an option to create a VirtualMachine from.')}</StackItem>
        </Stack>
      </div>
      <Tabs usePageInsets activeKey={currentTab} onSelect={handleTabClick}>
        <Tab
          eventKey={CREATE_VM_TAB.CATALOG}
          title={<CreateVMTabTitle Icon={CatalogIcon} titleText={t('Template catalog')} />}
        >
          <TemplatesCatalog match={match} location={location} history={history} />
        </Tab>
        <Tab
          eventKey={CREATE_VM_TAB.INSTANCE_TYPES}
          title={<CreateVMTabTitle Icon={ImageIcon} titleText={t('InstanceTypes')} badge />}
        >
          <CreateFromInstanceType />
          {currentTab === CREATE_VM_TAB.INSTANCE_TYPES && (
            <EnableInstanceTypeTechPreviewModal
              goBack={() => {
                const previousURL: string = (history.location.state as any)?.previousURL;
                history.goBack();
                isEmpty(previousURL) && setCurrentTab(CREATE_VM_TAB.CATALOG);
              }}
            />
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default CreateVMHorizontalNav;
