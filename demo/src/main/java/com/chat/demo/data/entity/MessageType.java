package com.chat.demo.data.entity;

public class MessageType {

    public enum Type {
        CHAT, JOIN, LEAVE
    }

    private Type type;

    public MessageType(Type type) {
        this.type = type;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }
}

    
