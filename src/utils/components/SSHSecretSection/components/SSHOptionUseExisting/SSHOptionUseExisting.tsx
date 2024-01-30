import React, { Dispatch, FC, SetStateAction, useCallback, useEffect, useState } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  K8sResourceCommon,
  ResourceLink,
  useActiveNamespace,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Bullseye,
  FormGroup,
  Grid,
  GridItem,
  Select,
  SelectOption,
  SelectVariant,
  TextInput,
} from '@patternfly/react-core';

import { SecretSelectionOption, SSHSecretDetails } from '../../utils/types';
import SecretDropdown from '../SecretDropdown/SecretDropdown';

type SSHOptionUseExistingProps = {
  localNSProject: string;
  namespace?: string;
  projectsWithSecrets: { [namespace: string]: IoK8sApiCoreV1Secret[] };
  setLocalNSProject: Dispatch<SetStateAction<string>>;
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  sshDetails: SSHSecretDetails;
};

const SSHOptionUseExisting: FC<SSHOptionUseExistingProps> = ({
  localNSProject,
  namespace,
  projectsWithSecrets,
  setLocalNSProject,
  setSSHDetails,
  sshDetails,
}) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<string>();
  const [projectsData] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
  });
  const projects = projectsData?.map(({ metadata }) => metadata?.name);
  const showNewSecretNameField = namespace
    ? selectedProject !== namespace
    : selectedProject !== sshDetails?.sshSecretNamespace;

  useEffect(
    () =>
      !selectedProject &&
      setSelectedProject(
        localNSProject || namespace || sshDetails?.sshSecretNamespace || projects?.[0],
      ),
    [namespace, localNSProject, projects, selectedProject, sshDetails?.sshSecretNamespace],
  );

  const onFilterProject = (_: any, value: string) => {
    const filteredProjects = projects?.filter((project) => project.includes(value));

    return filteredProjects?.map((project) => (
      <SelectOption key={project} value={project}>
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(ProjectModel)}
          linkTo={false}
          name={project}
        />
      </SelectOption>
    ));
  };

  const onSelectProject = useCallback(
    (_: any, newValue: string) => {
      setSelectedProject(newValue);
      setLocalNSProject(newValue);
      const addNew = namespace ? newValue !== namespace : newValue !== activeNamespace;
      setSSHDetails((prev) => ({
        ...prev,
        secretOption: addNew ? SecretSelectionOption.addNew : SecretSelectionOption.useExisting,
        sshPubKey: '',
        sshSecretName: '',
        sshSecretNamespace: newValue,
      }));

      setIsOpen(false);
    },
    [setLocalNSProject, namespace, activeNamespace, setSSHDetails],
  );

  const onChangeSecretName = (newSecretName: string) => {
    setSSHDetails((prev) => ({
      ...prev,
      sshSecretName: newSecretName,
    }));
    setIsOpen(false);
  };

  return !isEmpty(projects) ? (
    <>
      <Alert
        title={t(
          'Select a secret from a different project to copy the secret to your current project.',
        )}
        isInline
        variant={AlertVariant.info}
      />
      <Grid className="ssh-secret-section__body">
        <GridItem span={6}>
          <FormGroup fieldId="project" label={t('Project')}>
            <Select
              className="ssh-secret-section__form-group-project"
              hasInlineFilter
              inlineFilterPlaceholderText={t('Search project')}
              isOpen={isOpen}
              maxHeight={400}
              menuAppendTo="parent"
              onFilter={onFilterProject}
              onSelect={onSelectProject}
              onToggle={setIsOpen}
              selections={selectedProject}
              variant={SelectVariant.single}
            >
              {projects?.map((project) => (
                <SelectOption key={project} value={project}>
                  <ResourceLink
                    groupVersionKind={modelToGroupVersionKind(ProjectModel)}
                    linkTo={false}
                    name={project}
                  />
                </SelectOption>
              ))}
            </Select>
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup
            className="ssh-secret-section__form-group-secret"
            fieldId="secret"
            label={t('Public SSH key')}
          >
            <SecretDropdown
              namespace={namespace}
              secretsResourceData={projectsWithSecrets?.[selectedProject]}
              selectedProject={selectedProject}
              setSSHDetails={setSSHDetails}
              sshDetails={sshDetails}
            />
          </FormGroup>
        </GridItem>
      </Grid>
      {showNewSecretNameField && (
        <FormGroup label={t('New secret name')}>
          <TextInput
            id="new-secret-name"
            onChange={onChangeSecretName}
            type="text"
            value={sshDetails.sshSecretName}
          />
        </FormGroup>
      )}
    </>
  ) : (
    <Bullseye>{t('No ssh keys found')}</Bullseye>
  );
};

export default SSHOptionUseExisting;
