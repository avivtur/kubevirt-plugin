import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  V1beta1DataSource,
  V1beta1DataVolume,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { DEFAULT_DISK_SIZE } from '@kubevirt-utils/components/DiskModal/state/initialState';
import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { CDI_BIND_REQUESTED_ANNOTATION } from '@kubevirt-utils/hooks/useCDIUpload/consts';

export enum RADIO_FORM_SELECTION {
  UPLOAD_IMAGE = 'upload',
  USE_EXISTING_PVC = 'pvc',
}

export type AddBootableVolumeState = {
  bootableVolumeName: string;
  bootableVolumeNamespace: string;
  pvcName: string;
  pvcNamespace: string;
  uploadFile: File | string;
  uploadFilename: string;
  size: string;
  labels: { [key: string]: string };
  annotations: { [key: string]: string };
  storageClassName: string;
  storageClassProvisioner: string;
};
export const initialBootableVolumeState: AddBootableVolumeState = {
  bootableVolumeName: null,
  bootableVolumeNamespace: null,
  pvcName: null,
  pvcNamespace: null,
  uploadFile: null,
  uploadFilename: null,
  size: DEFAULT_DISK_SIZE,
  labels: {},
  annotations: {},
  storageClassName: null,
  storageClassProvisioner: null,
};

export const emptySourceDataVolume: V1beta1DataVolume = {
  apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
  kind: DataVolumeModel.kind,
  metadata: {
    name: '',
    namespace: OPENSHIFT_OS_IMAGES_NS,
    annotations: {
      [CDI_BIND_REQUESTED_ANNOTATION]: 'true',
    },
  },
  spec: {
    storage: {
      resources: {
        requests: {
          storage: '',
        },
      },
    },
  },
};

export const emptyDataSource: V1beta1DataSource = {
  apiVersion: `${DataSourceModel.apiGroup}/${DataSourceModel.apiVersion}`,
  kind: DataSourceModel.kind,
  metadata: {
    name: '',
    namespace: OPENSHIFT_OS_IMAGES_NS,
  },
  spec: { source: {} },
};
