import React, { Dispatch, FC, SetStateAction } from 'react';

import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/types';
import { getBootableVolumeGroupVersionKind } from '@catalog/CreateFromInstanceTypes/utils/utils';
import { getTemplateOSIcon as getOSIcon } from '@catalog/templatescatalog/utils/os-icons';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import {
  isDataSourceCloning,
  isDataSourceUploading,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { formatBytes } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Text, TextVariants, Truncate } from '@patternfly/react-core';
import { TableText, Tr, WrapModifier } from '@patternfly/react-table';

import TableData from './TableData';

type BootableVolumeRowProps = {
  bootableVolume: BootableVolume;
  activeColumnIDs: string[];
  rowData: {
    bootableVolumeSelectedState: [BootableVolume, Dispatch<SetStateAction<BootableVolume>>];
    preference: V1alpha2VirtualMachineClusterPreference;
    pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
  };
};

const BootableVolumeRow: FC<BootableVolumeRowProps> = ({
  bootableVolume,
  activeColumnIDs,
  rowData: {
    bootableVolumeSelectedState: [bootableVolumeSelected, setBootSourceSelected],
    preference,
    pvcSource,
  },
}) => {
  const { t } = useKubevirtTranslation();
  const bootVolumeName = bootableVolume?.metadata?.name;
  const sizeData = formatBytes(pvcSource?.spec?.resources?.requests?.storage);

  return (
    <Tr
      isHoverable
      isSelectable
      isRowSelected={bootableVolumeSelected?.metadata?.name === bootVolumeName}
      onClick={() => setBootSourceSelected(bootableVolume)}
    >
      <TableData activeColumnIDs={activeColumnIDs} id="name" width={20}>
        <ResourceIcon groupVersionKind={getBootableVolumeGroupVersionKind(bootableVolume)} />
        <img src={getOSIcon(preference)} alt="os-icon" className="vm-catalog-row-icon" />
        <Text component={TextVariants.small}>{bootVolumeName}</Text>
        {isDataSourceCloning(bootableVolume as V1beta1DataSource) && (
          <Label className="vm-catalog-row-label">{t('Clone in progress')}</Label>
        )}
        {isDataSourceUploading(bootableVolume as V1beta1DataSource) && (
          <Label className="vm-catalog-row-label">{t('Upload in progress')}</Label>
        )}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="namespace" width={10}>
        <Truncate content={bootableVolume?.metadata?.namespace} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="operating-system" width={15}>
        {preference?.metadata?.annotations?.[ANNOTATIONS.displayName] || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="storage-class" width={15}>
        {pvcSource?.spec?.storageClassName || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="size" width={10}>
        {sizeData || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={ANNOTATIONS.description} width={30}>
        <TableText wrapModifier={WrapModifier.truncate}>
          {bootableVolume?.metadata?.annotations?.[ANNOTATIONS.description] || NO_DATA_DASH}
        </TableText>
      </TableData>
    </Tr>
  );
};

export default BootableVolumeRow;
