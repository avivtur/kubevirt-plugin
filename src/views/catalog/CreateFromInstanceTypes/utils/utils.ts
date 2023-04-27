import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import DataSourceModel, {
  DataSourceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';

import { InstanceTypeSize } from '../components/SelectInstanceTypeSection/utils/types';
import { categoryNamePrefixMatcher } from '../components/SelectInstanceTypeSection/utils/utils';

import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_LABEL,
  InstanceTypeState,
} from './constants';
import { BootableVolume } from './types';

const generateCloudInitPassword = () =>
  `${getRandomChars(4)}-${getRandomChars(4)}-${getRandomChars(4)}`;

export const getInstanceTypeState = (defaultInstanceTypeName: string): InstanceTypeState => {
  const [prefix, size] = defaultInstanceTypeName?.split('.');
  const category = categoryNamePrefixMatcher[prefix];
  return {
    category,
    size: size as InstanceTypeSize,
    name: defaultInstanceTypeName,
  };
};

export const generateVM = (
  bootableVolume: BootableVolume,
  namespace: string,
  instanceTypeName: string,
  vmName?: string,
  storageClassName?: string,
) => {
  const virtualmachineName =
    vmName ??
    uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: '-',
    });

  const sourceMetadata = {
    name: bootableVolume?.metadata?.name,
    namespace: bootableVolume?.metadata?.namespace,
  };

  const emptyVM: V1VirtualMachine = {
    apiVersion: `${VirtualMachineModel.apiGroup}/${VirtualMachineModel.apiVersion}`,
    kind: VirtualMachineModel.kind,
    metadata: {
      name: virtualmachineName,
      namespace,
    },
    spec: {
      running: true,
      template: {
        spec: {
          domain: {
            devices: {
              disks: [
                {
                  disk: {
                    bus: 'virtio',
                  },
                  name: `${virtualmachineName}-disk`,
                },
                {
                  disk: {
                    bus: 'virtio',
                  },
                  name: 'cloudinitdisk',
                },
              ],
            },
          },
          volumes: [
            {
              dataVolume: { name: `${virtualmachineName}-volume` },
              name: `${virtualmachineName}-disk`,
            },
            {
              cloudInitNoCloud: {
                userData: `#cloud-config\nuser: fedora\npassword: ${generateCloudInitPassword()}\nchpasswd: { expire: False }`,
              },
              name: 'cloudinitdisk',
            },
          ],
        },
      },
      instancetype: {
        // inferFromVolume: `${virtualmachineName}-disk`,
        name: instanceTypeName || bootableVolume?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL],
      },
      preference: {
        // inferFromVolume: `${virtualmachineName}-disk`,
        name: bootableVolume?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL],
      },
      dataVolumeTemplates: [
        {
          metadata: {
            name: `${virtualmachineName}-volume`,
          },
          spec: {
            ...(isBootableVolumePVCKind(bootableVolume)
              ? {
                  source: {
                    pvc: { ...sourceMetadata },
                  },
                }
              : {
                  sourceRef: {
                    kind: DataSourceModel.kind,
                    ...sourceMetadata,
                  },
                }),
            storage: {
              storageClassName,
              resources: { requests: { storage: '' } },
            },
          },
        },
      ],
    },
  };

  return emptyVM;
};

export const isBootableVolumePVCKind = (bootableVolume: BootableVolume): boolean =>
  bootableVolume?.kind !== DataSourceModel.kind;

export const getBootableVolumeGroupVersionKind = (bootableVolume: BootableVolume) =>
  isBootableVolumePVCKind(bootableVolume)
    ? modelToGroupVersionKind(PersistentVolumeClaimModel)
    : DataSourceModelGroupVersionKind;

export const getBootableVolumePVCSource = (
  bootableVolume: BootableVolume,
  pvcSources: {
    [resourceKeyName: string]: IoK8sApiCoreV1PersistentVolumeClaim;
  },
) => {
  if (isEmpty(bootableVolume)) return null;
  return isBootableVolumePVCKind(bootableVolume)
    ? bootableVolume
    : pvcSources?.[(bootableVolume as V1beta1DataSource)?.spec?.source?.pvc?.namespace]?.[
        (bootableVolume as V1beta1DataSource)?.spec?.source?.pvc?.name
      ];
};
