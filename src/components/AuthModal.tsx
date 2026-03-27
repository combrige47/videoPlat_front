import { useState } from 'react';
import { login, register } from '../api/user';
import type { LoginRequest, RegisterRequest } from '../types/user';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState<LoginRequest | RegisterRequest>({
        account: '',
        password: '',
        username: '',
        email: '',
        bio: '',
        avatar: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const response = await login(formData as LoginRequest);
                if (response.code === 0) {
                    localStorage.setItem('token', response.data);
                    onClose();
                } else {
                    setError(response.message);
                }
            } else {
                const response = await register(formData as RegisterRequest);
                if (response.code === 0) {
                    // 注册成功后自动登录
                    const loginResponse = await login({
                        account: (formData as RegisterRequest).username,
                        password: (formData as RegisterRequest).password
                    });
                    if (loginResponse.code === 0) {
                        localStorage.setItem('token', loginResponse.data);
                        onSuccess(loginResponse.data.user);
                        onClose();
                    }
                } else {
                    setError(response.message);
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || '操作失败');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isLogin ? '登录' : '注册'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label>用户名</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={(formData as RegisterRequest).username}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>邮箱 (可选)</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={(formData as RegisterRequest).email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>简介 (可选)</label>
                                <textarea
                                    name="bio"
                                    value={(formData as RegisterRequest).bio}
                                    onChange={handleInputChange}
                                    rows={3}
                                />
                            </div>
                        </>
                    )}
                    <div className="form-group">
                        <label>{isLogin ? '账号' : '用户名'}</label>
                        <input
                            type="text"
                            name={isLogin ? "account" : "username"}
                            value={isLogin ? (formData as LoginRequest).account : (formData as RegisterRequest).username}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>密码</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    {error && <div className="error">{error}</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
                    </button>
                </form>
                <div className="modal-footer">
                    <button onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
                    </button>
                </div>
            </div>
        </div>
    );
}