import React from 'react'
import { UserInfo, defaultUserInfo } from '@/contexts/UserInfoContext'
import { format } from 'date-fns'
import AvatarDOM from '@/components/AvatarCanvas/AvatarDOM'
import _ from 'lodash'

const ChatHistory = () => {

  const stubMessages = [
    {
      user: {
        ...defaultUserInfo,
        name: "Test",
        avatarColor: {
          background: 'red',
          border: '#00000000'
        }
      },
      body: "Hello",
      dateSent: new Date()
    },
    {
      user: {
        ...defaultUserInfo,
        name: "Test",
        avatarColor: {
          background: 'red',
          border: '#00000000'
        }
      },
      body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      dateSent: new Date()
    }
  ]

  const messages: { user: UserInfo, body: string, dateSent: Date }[] = stubMessages

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    const target = e.target as typeof e.target & { message: { value: string } }
    target.message.value = ''
    // sendMessage(target.message.value)
  }

  return (
    <div className="chat-history-container">
      {messages.map(({ user, body, dateSent }, idx) => (
        <div className="chat-history-row" key={idx}>
          <div className="chat-history-row__avatar">
            <AvatarDOM
              isSelf={false}
              _backgroundColor={user.avatarColor.background}
              _borderColor={user.avatarColor.border}
              initial={user.name[0]}
              active={true}
              mute={false}
              size="small"
              id={user.id}
            />
          </div>
          <div className="chat-history-message">
            <div className="chat-history-message__header">
              <div className="chat-histroy-message__name">{user.name}</div>
              <div className="chat-histroy-message__date">{format(dateSent, "MM/dd HH:mm")}</div>
            </div>
            <div className="chat-histroy-message__body">{body}</div>
          </div>
        </div>
      ))}
      <form onSubmit={handleSend} className="chat-history-form">
        <div>
          <input name="message" />
        </div>
        <div>
          <button type="submit">Send</button>
        </div>
      </form>
    </div>
  )
}

export default React.memo(ChatHistory)
