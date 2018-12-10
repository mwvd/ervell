import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { propType } from 'graphql-anywhere';
import { some, unescape } from 'underscore';
import styled from 'styled-components';

import mapErrors from 'react/util/mapErrors';
import compactObject from 'react/util/compactObject';

import manageChannelFragment from 'react/components/ManageChannel/fragments/manageChannel';
import manageChannelQuery from 'react/components/ManageChannel/queries/manageChannel';
import updateChannelMutation from 'react/components/ManageChannel/mutations/updateChannel';

import Box from 'react/components/UI/Box';
import ErrorAlert from 'react/components/UI/ErrorAlert';
import Accordion from 'react/components/UI/Accordion';
import Text from 'react/components/UI/Text';
import LoadingIndicator from 'react/components/UI/LoadingIndicator';
import TitledDialog from 'react/components/UI/TitledDialog';
import RadioOptions from 'react/components/UI/RadioOptions';
import { LabelledInput, Label, Input, Textarea } from 'react/components/UI/Inputs';

import ExportChannel from 'react/components/ManageChannel/components/ExportChannel';
import DeleteChannel from 'react/components/ManageChannel/components/DeleteChannel';
import TransferChannel from 'react/components/ManageChannel/components/TransferChannel';
import ChannelVisibilityPulldown from 'react/components/ChannelVisibilityPulldown';

const Container = styled.div`
  width: 100%;
  margin: 0 auto 2em auto;
`;

class ManageChannel extends Component {
  static propTypes = {
    data: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
      channel: propType(manageChannelFragment),
    }).isRequired,
    updateChannel: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  state = {
    mode: 'resting',
    title: null,
    description: null,
    visibility: null,
    attributeErrors: {},
    content_flag: null,
    errorMessage: '',
  };

  handleInput = fieldName => ({ target: { value: fieldValue } }) => {
    const { data: { channel: originalChannel } } = this.props;

    const isEdited = some(originalChannel, (originalValue, key) =>
      fieldName === key && originalValue !== fieldValue);

    this.setState({
      mode: isEdited ? 'submit' : 'resting',
      [fieldName]: fieldValue,
    });
  }

  handleTitle = this.handleInput('title')
  handleDescription = this.handleInput('description')
  handleVisibility = visibility =>
    this.handleInput('visibility')({ target: { value: visibility } });

  handleNSFW = flag =>
    this.handleInput('content_flag')({ target: { value: flag } });


  handleSubmit = (e) => {
    e.preventDefault();

    const {
      onClose, updateChannel, data: { channel: { id } },
    } = this.props;

    const {
      mode, title, description, visibility, content_flag,
    } = this.state;

    if (mode === 'resting') return onClose();

    this.setState({ mode: 'submitting' });

    const variables = compactObject({
      id, title, description, visibility, content_flag,
    });

    return updateChannel({ variables })
      .then(({ data: { update_channel: { channel: { href } } } }) => {
        onClose();
        // Slug may have changed so redirect
        window.location = href;
      })
      .catch((err) => {
        this.setState({
          mode: 'error',
          ...mapErrors(err),
        });
      });
  }

  render() {
    const { data: { loading } } = this.props;
    const {
      mode,
      attributeErrors,
      errorMessage,
    } = this.state;

    if (loading) return <LoadingIndicator />;

    const { data: { channel } } = this.props;

    console.log('channel', unescape(channel.title));

    return (
      <TitledDialog
        title="Edit channel"
        label={{
          resting: 'Done',
          submit: 'Save',
          submitting: 'Saving...',
          deleting: 'Deleting...',
          error: 'Error',
        }[mode]}
        onDone={this.handleSubmit}
      >
        <Container>
          {mode === 'error' &&
            <ErrorAlert isReloadable={false}>
              {errorMessage}
            </ErrorAlert>
          }

          <Accordion label="Edit name, description, and privacy">
            <LabelledInput>
              <Label>Name</Label>

              <Input
                name="title"
                defaultValue={unescape(channel.title)}
                onChange={this.handleTitle}
                errorMessage={attributeErrors.title}
                required
              />
            </LabelledInput>

            <LabelledInput>
              <Label>
                Description
              </Label>

              <Textarea
                name="description"
                defaultValue={channel.description}
                onChange={this.handleDescription}
                placeholder="describe your channel here"
                rows="3"
                errorMessage={attributeErrors.description}
              />
            </LabelledInput>

            <LabelledInput>
              <Label>
                Privacy
              </Label>

              <div>
                <ChannelVisibilityPulldown
                  value={channel.visibility.toUpperCase()}
                  onChange={this.handleVisibility}
                />
              </div>
            </LabelledInput>
          </Accordion>

          <Accordion label="NSFW?" mode="closed">
            <Box m={7}>
              <Text f={2} mb={7}>
                Not Safe For Work (NSFW) channels are hidden from Explore
                and are only visible on your profile to people who have the
                &quot;Show NSFW Content&quot; setting turned on.
              </Text>
              <RadioOptions value={channel.content_flag.toUpperCase()} onSelect={this.handleNSFW} size="1em">
                <RadioOptions.Option value="SAFE">
                  {() => (
                    <Text f={3} mb={3}>
                      <strong>No</strong>
                    </Text>
                  )}
                </RadioOptions.Option>

                <RadioOptions.Option value="NSFW">
                  {() => (
                    <Text f={3} mb={3}>
                      <strong>Yes</strong>
                    </Text>
                  )}
                </RadioOptions.Option>
              </RadioOptions>
            </Box>
          </Accordion>

          {channel.can.export &&
            <Accordion label="Export" mode="closed">
              <Box m={7}>
                <ExportChannel id={channel.id} />
              </Box>
            </Accordion>
          }

          {channel.can.transfer &&
            <Accordion label="Transfer ownership" mode="closed">
              <Box m={7}>
                <TransferChannel channel={channel} />
              </Box>
            </Accordion>
          }

          {channel.can.destroy &&
            <Accordion label="Delete channel" mode="closed">
              <Box m={7}>
                <DeleteChannel id={channel.id} />
              </Box>
            </Accordion>
          }
        </Container>
      </TitledDialog>
    );
  }
}

export default compose(
  graphql(manageChannelQuery),
  graphql(updateChannelMutation, { name: 'updateChannel' }),
)(ManageChannel);
