import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { propType } from 'graphql-anywhere'

import Box from 'v2/components/UI/Box'
import Text from 'v2/components/UI/Text'
import Modal from 'v2/components/UI/Modal/Portal'
import ManageBlock from 'v2/components/ManageBlock'
import BlockLightboxModalDialog from 'v2/components/BlockLightbox/components/BlockLightboxModalDialog'

import blockLightboxTextFragment from 'v2/components/BlockLightbox/components/BlockLightboxText/fragments/blockLightboxText'

export default class BlockLightboxText extends PureComponent {
  static propTypes = {
    layout: PropTypes.oneOf(['DEFAULT', 'FULLSCREEN']).isRequired,
    block: propType(blockLightboxTextFragment).isRequired,
  }

  state = {
    mode: 'resting',
  }

  openModal = e => {
    //
    // Cancel modal if text is selected or if this is a link
    //
    if (
      window.getSelection().toString() ||
      window.getSelection().toString() !== '' ||
      e.target.tagName.toLowerCase() === 'a'
    ) {
      return false
    }
    this.setState({ mode: 'editing' })
  }

  closeModal = () => this.setState({ mode: 'resting' })

  render() {
    const { mode } = this.state
    const { block, layout } = this.props

    return (
      <React.Fragment>
        {mode === 'editing' && (
          <Modal onClose={this.closeModal} Dialog={BlockLightboxModalDialog}>
            <ManageBlock
              block={block}
              onDone={this.closeModal}
              onChangePending={this.handleChangePending}
              autoFocus="body"
            />
          </Modal>
        )}

        <Box height="100%" width="100%">
          <Box height="100%" width="100%" p={9} overflowScrolling>
            <Box
              minHeight="100%"
              width={{ DEFAULT: '100%', FULLSCREEN: '75%' }[layout]}
              maxWidth="55em"
              bg={{ DEFAULT: 'white', FULLSCREEN: 'gray.bold' }[layout]}
              border="1px solid"
              borderColor={
                { DEFAULT: 'gray.light', FULLSCREEN: 'gray.semiBold' }[layout]
              }
              px={7}
              py={6}
              mx="auto"
              overflow="hidden"
              onClick={block.can.manage ? this.openModal : undefined}
            >
              <Text
                font="serif"
                f={[4, 4, 5]}
                lineHeight={2}
                color={{ DEFAULT: 'gray.base', FULLSCREEN: 'white' }[layout]}
                dangerouslySetInnerHTML={{ __html: block.content }}
                boldLinks
                hoverLinks={{ color: 'black' }}
              />
            </Box>

            {layout === 'FULLSCREEN' && block.title && (
              <Text
                mt={6}
                f={5}
                lineHeight={2}
                color="gray.hint"
                fontWeight="bold"
                textAlign="center"
              >
                {block.title}
              </Text>
            )}
          </Box>
        </Box>
      </React.Fragment>
    )
  }
}
