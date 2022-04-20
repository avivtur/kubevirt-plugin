import * as React from 'react';

import { VirtualMachineInstanceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ActionMenuVariant } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';
import { LazyActionMenu } from '@openshift-console/dynamic-plugin-sdk-internal';

type VirtualMachinesInsanceActionsProps = {
  vmi: V1VirtualMachineInstance;
};

const VirtualMachineInstanceActions: React.FC<VirtualMachinesInsanceActionsProps> = ({ vmi }) => {
  return (
    <LazyActionMenu
      variant={ActionMenuVariant.DROPDOWN}
      key={vmi?.metadata?.name}
      context={{ [VirtualMachineInstanceModelRef]: vmi }}
    />
  );
};

export default VirtualMachineInstanceActions;
